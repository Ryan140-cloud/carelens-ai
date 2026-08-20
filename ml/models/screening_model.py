"""
CareLens AI - PyTorch Transfer Learning Screening Model Architecture
Supports EfficientNet-B0 and ResNet50 backbones for multi-label / multi-class
retinal fundus disease screening.

Target Classes (ODIR-5K Verified Scheme):
0: Normal (N)
1: Diabetes / Diabetic Retinopathy (D)
2: Glaucoma (G)
3: Cataract (C)
4: Age-related Macular Degeneration (A)
5: Hypertension (H)
6: Myopia (M)
7: Other Abnormality / Pathology (O)
"""

import torch
import torch.nn as nn
from torchvision import models

CLASS_LABELS = [
    "Normal",
    "Diabetes / Diabetic Retinopathy",
    "Glaucoma",
    "Cataract",
    "Age-related Macular Degeneration",
    "Hypertension",
    "Myopia",
    "Other Abnormality"
]

CLASS_SHORT_NAMES = ["N", "D", "G", "C", "A", "H", "M", "O"]

class CareLensScreeningNet(nn.Module):
    def __init__(self, backbone: str = "efficientnet_b0", num_classes: int = 8, pretrained: bool = True):
        super(CareLensScreeningNet, self).__init__()
        self.backbone_name = backbone
        self.num_classes = num_classes

        if backbone == "efficientnet_b0":
            weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
            self.backbone = models.efficientnet_b0(weights=weights)
            in_features = self.backbone.classifier[1].in_features
            self.backbone.classifier = nn.Sequential(
                nn.Dropout(p=0.3, inplace=True),
                nn.Linear(in_features, num_classes)
            )
            # Target layer for Grad-CAM
            self.target_layer = self.backbone.features[-1]

        elif backbone == "resnet50":
            weights = models.ResNet50_Weights.DEFAULT if pretrained else None
            self.backbone = models.resnet50(weights=weights)
            in_features = self.backbone.fc.in_features
            self.backbone.fc = nn.Sequential(
                nn.Dropout(p=0.4),
                nn.Linear(in_features, num_classes)
            )
            # Target layer for Grad-CAM
            self.target_layer = self.backbone.layer4[-1]
        else:
            raise ValueError(f"Unsupported backbone: {backbone}. Choose 'efficientnet_b0' or 'resnet50'.")

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)

    def get_target_layer_for_gradcam(self) -> nn.Module:
        return self.target_layer
