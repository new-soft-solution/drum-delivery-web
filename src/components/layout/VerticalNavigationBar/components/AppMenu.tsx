"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Fragment,
  type MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Collapse } from "react-bootstrap";

import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { findAllParent, findMenuItem, getMenuItemFromURL } from "@/utils/menu";
import type { MenuItemType, SubMenus } from "@/types/menu.type";
import { LanguageContext } from "@/context/LanguageContext";
import { usePermissions } from "@/utils/permissions";

const MenuItemWithChildren = ({
  item,
  className,
  linkClassName,
  subMenuClassName,
  activeMenuItems,
  toggleMenu,
}: SubMenus) => {
  const { lang } = useContext(LanguageContext);
  const [open, setOpen] = useState<boolean>(
    activeMenuItems!.includes(item.key),
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(activeMenuItems!.includes(item.key));
  }, [activeMenuItems, item]);

  const toggleMenuItem = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const status = !open;
    setOpen(status);
    if (toggleMenu) toggleMenu(item, status);
    return false;
  };

  const getActiveClass = (item: MenuItemType) => {
    return activeMenuItems?.includes(item.key) ? "active" : "";
  };

  return (
    <li className={className}>
      <div
        onClick={toggleMenuItem}
        aria-expanded={open}
        data-bs-toggle="collapse"
        className={linkClassName}
        role="button"
      >
        {item.icon && (
          <i className="menu-icon">
            <IconifyIcon icon={item.icon} />
          </i>
        )}
        <span>{lang === "nl" ? item.label_nl : item.label}</span>
        {item.badge && (
          <span
            className={`badge rounded text-${item.badge.variant} ms-1 bg-${item.badge.variant}-subtle`}
          >
            {item.badge.text}
          </span>
        )}
        <IconifyIcon icon="la:angle-right" className="menu-arrow" />
      </div>
      <Collapse in={open}>
        <div>
          <ul className={subMenuClassName}>
            {(item.children || []).map((child, idx) => {
              return (
                <Fragment key={child.key + idx}>
                  {child.children ? (
                    <MenuItemWithChildren
                      item={child}
                      linkClassName={clsx("nav-link", getActiveClass(child))}
                      activeMenuItems={activeMenuItems}
                      className="nav-item"
                      subMenuClassName="nav flex-column"
                      toggleMenu={toggleMenu}
                    />
                  ) : (
                    <MenuItem
                      item={child}
                      className="nav-item"
                      linkClassName={clsx("nav-link", getActiveClass(child))}
                    />
                  )}
                </Fragment>
              );
            })}
          </ul>
        </div>
      </Collapse>
    </li>
  );
};

const MenuItem = ({ item, className, linkClassName }: SubMenus) => {
  return (
    <li className={`${className}`}>
      <MenuItemLink item={item} className={linkClassName} />
    </li>
  );
};

const MenuItemLink = ({ item, className }: SubMenus) => {
  const { lang } = useContext(LanguageContext);
  return (
    <Link href={item.url ?? ""} className={clsx(className)}>
      {item.icon && (
        <i className="menu-icon">
          <IconifyIcon icon={item.icon} />
        </i>
      )}
      <span>{lang === "nl" ? item.label_nl : item.label}</span>
      {item.badge ? (
        <span
          className={`badge rounded text-${item.badge.variant} ms-1 bg-${item.badge.variant}-subtle`}
        >
          {item.badge.text}
        </span>
      ) : null}
    </Link>
  );
};

type AppMenuProps = {
  menuItems: Array<MenuItemType>;
};

const AppMenu = ({ menuItems: allMenuItems }: AppMenuProps) => {
  const { lang } = useContext(LanguageContext);
  const pathname = usePathname();
  const [activeMenuItems, setActiveMenuItems] = useState<Array<string>>([]);
  const { has } = usePermissions();

  // Items with no `permission` (section titles, Dashboard) always show;
  // everything else needs the user to actually hold that codename. This
  // is the sidebar half of access control — RequireModuleView on each
  // page is the other half, for anyone who navigates to the URL directly.
  const menuItems = useMemo(
    () =>
      allMenuItems.filter((item) => !item.permission || has(item.permission)),
    [allMenuItems, has],
  );

  // menuItems is memoized above, but that alone wasn't enough to stop a
  // "Maximum update depth exceeded" loop in practice — some upstream
  // instability (permissions/session/store internals) could still give
  // it a new reference on more renders than expected, and the old
  // activeMenu (useCallback depending on menuItems) -> useEffect
  // (depending on activeMenu) -> setActiveMenuItems chain turned any such
  // instability straight into an infinite loop.
  //
  // Fixed more robustly here by breaking that chain rather than trying to
  // guarantee menuItems never changes reference: activeMenu now reads
  // menuItems from a ref instead of a dependency, so it only needs
  // `pathname` to decide whether to recompute — normal navigation is the
  // only thing that should re-run "which sidebar item matches the current
  // URL" anyway. The ref-sync effect below only ever writes to a ref, so
  // it can never itself trigger a render, however often menuItems changes.
  const menuItemsRef = useRef(menuItems);
  useEffect(() => {
    menuItemsRef.current = menuItems;
  }, [menuItems]);

  const toggleMenu = (menuItem: MenuItemType, show: boolean) => {
    if (show)
      setActiveMenuItems([
        menuItem.key,
        ...findAllParent(menuItemsRef.current, menuItem),
      ]);
  };

  const getActiveClass = (item: MenuItemType) => {
    return activeMenuItems?.includes(item.key) ? "active" : "";
  };

  const activeMenu = useCallback(() => {
    const currentMenuItems = menuItemsRef.current;
    const trimmedURL = pathname?.replaceAll("", "");
    const matchingMenuItem = getMenuItemFromURL(currentMenuItems, trimmedURL);

    if (matchingMenuItem) {
      const activeMt = findMenuItem(currentMenuItems, matchingMenuItem.key);
      if (activeMt) {
        const nextActive = [
          activeMt.key,
          ...findAllParent(currentMenuItems, activeMt),
        ];
        setActiveMenuItems((prev) => {
          // Bail out on an equal result so this never causes a render
          // (and therefore never re-fires anything downstream) when
          // nothing actually changed — extra safety on top of activeMenu
          // now only depending on `pathname`.
          if (
            prev.length === nextActive.length &&
            prev.every((k, i) => k === nextActive[i])
          ) {
            return prev;
          }
          return nextActive;
        });
      }

      setTimeout(() => {
        const activatedItem: HTMLAnchorElement | null = document.querySelector(
          `#leftside-menu-container .simplebar-content a[href="${trimmedURL}"]`,
        );
        if (activatedItem) {
          const simplebarContent = document.querySelector(
            "#leftside-menu-container .simplebar-content-wrapper",
          );
          if (simplebarContent) {
            const offset = activatedItem.offsetTop - window.innerHeight * 0.4;
            scrollTo(simplebarContent, offset, 600);
          }
        }
      }, 400);

      // scrollTo (Left Side Bar Active Menu)
      const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t + b;
        t--;
        return (-c / 2) * (t * (t - 2) - 1) + b;
      };

      const scrollTo = (element: Element, to: number, duration: number) => {
        const start = element.scrollTop,
          change = to - start,
          increment = 20;
        let currentTime = 0;
        const animateScroll = function () {
          currentTime += increment;
          const val = easeInOutQuad(currentTime, start, change, duration);
          element.scrollTop = val;
          if (currentTime < duration) {
            setTimeout(animateScroll, increment);
          }
        };
        animateScroll();
      };
    }
    // Deliberately NOT depending on menuItems (read via menuItemsRef
    // instead) — see the comment above menuItemsRef.
  }, [pathname]);

  useEffect(() => {
    activeMenu();
  }, [activeMenu]);

  return (
    <ul className="navbar-nav mb-auto w-100">
      {(menuItems || []).map((item, idx) => {
        return (
          <Fragment key={item.key + idx}>
            {item.isTitle ? (
              <li
                className={clsx("menu-label", idx === 0 ? "pt-0 mt-0" : "mt-2")}
              >
                <small className={clsx({ "label-border": idx != 0 })}>
                  <div className="border_left hidden-xs" />
                  <div className="border_right" />
                </small>
                <span>{lang === "nl" ? item.label_nl : item.label}</span>
              </li>
            ) : (
              <>
                {item.children ? (
                  <MenuItemWithChildren
                    item={item}
                    toggleMenu={toggleMenu}
                    className="nav-item"
                    linkClassName={clsx("nav-link", getActiveClass(item))}
                    subMenuClassName="nav flex-column"
                    activeMenuItems={activeMenuItems}
                  />
                ) : (
                  <MenuItem
                    item={item}
                    linkClassName={clsx("nav-link", getActiveClass(item))}
                    className="nav-item"
                  />
                )}
              </>
            )}
          </Fragment>
        );
      })}
    </ul>
  );
};

export default AppMenu;
