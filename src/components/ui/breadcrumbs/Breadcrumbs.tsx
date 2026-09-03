"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {getBreadcrumbs} from "@/utils/breadcrumb-utils";
import {MENU_ITEMS} from "@/assets/data/menu-items";
import IconifyIcon from "@/components/wrappers/IconifyIcon";

const Breadcrumbs = () => {
    const pathname = usePathname();
    let breadcrumbs = getBreadcrumbs(MENU_ITEMS, pathname);

    // Handle dynamic routes by trying parent paths
    if (breadcrumbs.length === 0 && pathname.startsWith("/fat-admin")) {
        const pathSegments = pathname.split("/").filter(Boolean);

        // Try to match parent route (e.g., /fat-admin/restaurants for /fat-admin/restaurants/333)
        if (pathSegments.length > 2) {
            const parentPath = "/" + pathSegments.slice(0, -1).join("/");
            breadcrumbs = getBreadcrumbs(MENU_ITEMS, parentPath);

            // If parent found, optionally add current segment as label
            if (breadcrumbs.length > 0) {
                const currentSegment = pathSegments[pathSegments.length - 1];
                // Only add if it looks like an ID (optional - customize based on your needs)
                if (/^\d+$/.test(currentSegment)) {
                    breadcrumbs.push({
                        label: `Details`,
                        url: pathname,
                    });
                }
            }
        }
    }

    // Handle specific fallback cases
    if (breadcrumbs.length === 0 && pathname.startsWith("/")) {
        if (pathname.endsWith("/profile")) {
            breadcrumbs = [
                {label: "Dashboard", url: "/"},
                {label: "Profile", url: "/profile"},
            ];
        } else {
            breadcrumbs = [{label: "Dashboard", url: "/"}];
        }
    }

    // Prepend "Dashboard" if not already present
    let fullBreadcrumbs = breadcrumbs;
    if (
        fullBreadcrumbs.length > 0 &&
        fullBreadcrumbs[0].label !== "Dashboard"
    ) {
        fullBreadcrumbs = [
            {label: "Dashboard", url: "/"},
            ...fullBreadcrumbs,
        ];
    }

    return (
        <nav aria-label="breadcrumb" className="d-flex">
            <ol className="breadcrumbs">
                {fullBreadcrumbs.map((crumb, index) => (
                    <li
                        key={crumb.label}
                        style={{zIndex: fullBreadcrumbs.length - index}}
                    >
                        {crumb.url && index < fullBreadcrumbs.length - 1 ? (
                            <Link className="link" href={crumb.url}>
                                {crumb.label === "Dashboard" ? (
                                    <IconifyIcon icon="iconoir:home-simple-door" fontSize={20}/>
                                ) : (
                                    <IconifyIcon
                                        icon="iconoir:long-arrow-up-left"
                                        className="icon"
                                        fontSize={20}
                                    />
                                )}
                                <span className="text d-none d-sm-inline">{crumb.label}</span>
                            </Link>
                        ) : (
                            <span className="current-link">
                {crumb.label === "Dashboard" && (
                    <IconifyIcon
                        icon="iconoir:home-simple-door"
                        className="icon"
                        fontSize={20}
                    />
                )}
                                <span className="text">{crumb.label}</span>
              </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;