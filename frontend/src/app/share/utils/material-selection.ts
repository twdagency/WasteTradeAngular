import { signal, WritableSignal } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';

type MaterialSelectionController = {
  selectAllMaterial: WritableSignal<boolean>;
  expandAllMaterials: WritableSignal<boolean>;
  expandedMaterialGroup: WritableSignal<string | null>;
  toggleSelectAllMaterials: () => void;
  onMaterialPanelToggle: (name: string, expanded: boolean) => void;
  updateSelectAllMaterialState: () => void;
  areAllMaterialsSelected: () => boolean;
};

type CreateMaterialSelectionControllerParams = {
  allMaterialCodes: string[];
  materials: FormArray;
  markTouchedOnSelectAll?: boolean;
  markDirtyOnSelectAll?: boolean;
  onSelectionChanged?: () => void;
};

export function createMaterialSelectionController(
  params: CreateMaterialSelectionControllerParams,
): MaterialSelectionController {
  const selectAllMaterial = signal(false);
  const expandAllMaterials = signal(false);
  const expandedMaterialGroup = signal<string | null>(null);
  const isApplyingExpandAll = signal(false);

  const areAllMaterialsSelected = () => {
    if (params.allMaterialCodes.length === 0) {
      return false;
    }
    const selected = new Set(params.materials.value as string[]);
    return params.allMaterialCodes.every((code) => selected.has(code));
  };

  const updateSelectAllMaterialState = () => {
    selectAllMaterial.set(areAllMaterialsSelected());
  };

  const toggleSelectAllMaterials = () => {
    const shouldSelectAll = !areAllMaterialsSelected();
    params.materials.clear();
    if (shouldSelectAll) {
      isApplyingExpandAll.set(true);
      params.allMaterialCodes.forEach((code) => {
        params.materials.push(new FormControl(code));
      });
      if (params.markTouchedOnSelectAll) {
        params.materials.markAsTouched();
      }
      if (params.markDirtyOnSelectAll) {
        params.materials.markAsDirty();
      }
      expandAllMaterials.set(true);
      expandedMaterialGroup.set(null);
    } else {
      expandAllMaterials.set(false);
    }

    params.materials.updateValueAndValidity();
    params.onSelectionChanged?.();
    selectAllMaterial.set(shouldSelectAll);

    if (shouldSelectAll) {
      queueMicrotask(() => isApplyingExpandAll.set(false));
    }
  };

  const onMaterialPanelToggle = (name: string, expanded: boolean) => {
    if (isApplyingExpandAll()) {
      return;
    }
    expandAllMaterials.set(false);
    if (expanded) {
      expandedMaterialGroup.set(name);
      return;
    }
    if (expandedMaterialGroup() === name) {
      expandedMaterialGroup.set(null);
    }
  };

  return {
    selectAllMaterial,
    expandAllMaterials,
    expandedMaterialGroup,
    toggleSelectAllMaterials,
    onMaterialPanelToggle,
    updateSelectAllMaterialState,
    areAllMaterialsSelected,
  };
}
