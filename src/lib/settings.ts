export const ITEM_PER_PAGE = 10;

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/admin(.*)": ["admin", "user"],
  "/list/users": ["admin"],
  "/list/shortlinks": ["admin", "user"],
  "/list/domains": ["admin", "user"],
};
