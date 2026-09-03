import {MenuItemType} from "@/types/menu.type";

export function getBreadcrumbs(
    menuItems: MenuItemType[],
    pathname: string,
    path: { label: string; url?: string }[] = []
): { label: string; url?: string }[] {
    for (const item of menuItems) {
        // Determine the effective URL for this item (use first child's if parent lacks one)
        const effectiveUrl = item.url ?? (item.children?.[0]?.url);

        // URL matches the pathname
        if (effectiveUrl === pathname) {
            return [...path, { label: item.label, url: effectiveUrl }];
        }

        if (item.children) {
            const childPath = getBreadcrumbs(item.children, pathname, [
                ...path,
                { label: item.label, url: effectiveUrl },
            ]);
            if (childPath.length > 0) {
                return childPath;
            }
        }
    }
    return []; // No match found
}