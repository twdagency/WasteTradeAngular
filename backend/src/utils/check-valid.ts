import { ContainerType, AreaCovered, MaterialEnum } from '../enum';

export function checkValidMaterial(materials: string[]): boolean {
    if (!Array.isArray(materials)) return false;
    return materials.every((material) => Object.values(MaterialEnum).includes(material as MaterialEnum));
}

export function checkValidContainerType(containerTypes: string[]): boolean {
    if (!Array.isArray(containerTypes)) return false;
    return containerTypes.every((containerType) =>
        Object.values(ContainerType).includes(containerType as ContainerType),
    );
}

export function checkValidAreaCovered(areaCovered: string[]): boolean {
    if (!areaCovered) return false;
    return areaCovered.every((area) => Object.values(AreaCovered).includes(area as AreaCovered));
}
