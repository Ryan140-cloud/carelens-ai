"""
CareLens AI - Grad-CAM Explainable AI (XAI) Implementation
Generates activation visual heatmaps overlaying input retinal fundus images.

Medical Safety Disclaimer:
The generated visual heatmaps highlight regions of the image that contributed
most to the AI model's internal feature representations. Heatmaps are for model
interpretability only and DO NOT constitute clinical diagnosis or anatomical proof.
"""

import cv2
import base64
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
import io
from typing import Tuple

def encode_image_to_base64(pil_img: Image.Image) -> str:
    """
    Converts PIL Image to Base64 data URL string.
    """
    buffer = io.BytesIO()
    pil_img.save(buffer, format="JPEG", quality=90)
    b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{b64_str}"

class GradCAM:
    def __init__(self, model: torch.nn.Module, target_layer: torch.nn.Module):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None

        # Register forward and backward hooks
        self.target_layer.register_forward_hook(self._save_activation)
        self.target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, module, input, output):
        self.activations = output

    def _save_gradient(self, module, grad_input, grad_output):
        self.gradients = grad_output[0]

    def generate_cam(
        self, input_tensor: torch.Tensor, target_class_idx: int = None
    ) -> np.ndarray:
        """
        Generates a normalized 2D Grad-CAM heatmap array (0.0 to 1.0).
        """
        self.model.eval()

        # Forward pass
        output = self.model(input_tensor)

        if target_class_idx is None:
            target_class_idx = torch.argmax(output, dim=1).item()

        # Zero existing gradients
        self.model.zero_grad()

        # Target score for backward pass
        score = output[0, target_class_idx]
        score.backward(retain_graph=True)

        # Calculate channel importance weights (global average pooling of gradients)
        gradients = self.gradients[0]  # [C, H, W]
        activations = self.activations[0]  # [C, H, W]

        weights = torch.mean(gradients, dim=(1, 2), keepdim=True)  # [C, 1, 1]

        # Weighted combination of forward activation maps
        cam = torch.sum(weights * activations, dim=0)  # [H, W]

        # Apply ReLU to retain positive influences
        cam = F.relu(cam)

        # Normalize to [0, 1]
        cam = cam.detach().cpu().numpy()
        if cam.max() > 0:
            cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
        else:
            cam = np.zeros_like(cam)

        return cam

    def overlay_heatmap_on_image(
        self,
        original_pil_image: Image.Image,
        heatmap_2d: np.ndarray,
        alpha: float = 0.45
    ) -> Image.Image:
        """
        Overlays 2D heatmap onto original image.
        """
        w, h = original_pil_image.size
        img_np = np.array(original_pil_image.convert("RGB"))

        # Resize heatmap to match original image dimensions
        resized_heatmap = cv2.resize(heatmap_2d, (w, h))

        # Convert heatmap to uint8 [0, 255] and apply COLORMAP_JET
        heatmap_uint8 = np.uint8(255 * resized_heatmap)
        color_heatmap = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
        color_heatmap = cv2.cvtColor(color_heatmap, cv2.COLOR_BGR2RGB)

        # Blend original image with color heatmap
        blended = np.float32(img_np) * (1.0 - alpha) + np.float32(color_heatmap) * alpha
        blended = np.clip(blended, 0, 255).astype(np.uint8)

        return Image.fromarray(blended)

    def overlay_heatmap(
        self,
        original_pil_image: Image.Image,
        heatmap_2d: np.ndarray,
        alpha: float = 0.45
    ) -> Tuple[Image.Image, str]:
        """
        Overlays the 2D heatmap onto original image and returns a Base64 data URL.
        """
        overlay_pil = self.overlay_heatmap_on_image(original_pil_image, heatmap_2d, alpha)
        data_url = encode_image_to_base64(overlay_pil)
        return overlay_pil, data_url
