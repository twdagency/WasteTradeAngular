export namespace StringHelper {
    export function capitalizeFirstLetter(text: string): string {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }

    export function snakeCaseToTitleCase(text: string): string {
        if (!text) return '';
        return text
            .split('_')
            .map((word) => capitalizeFirstLetter(word))
            .join(' ');
    }
}
