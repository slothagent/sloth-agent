import { Route as rootRoute } from "./routes/__root";
import { Route as IndexImport } from "./routes/index";
import { Route as TokenDetailsImport } from "./routes/token.$tokenAddress";
import { Route as TokenImport } from "./routes/token";
import { Route as AgentCreateImport } from "./routes/create-agent";
import { Route as AgentsImport } from "./routes/agents";
import { Route as TokenCreateImport } from "./routes/create-token";
import { Route as AgentDetailsImport } from "./routes/agent.$agentId";

// Create/Update Routes
const IndexRoute = IndexImport.update({
  id: "/",
  path: "/",
  getParentRoute: () => rootRoute,
} as any);

const TokenRoute = TokenImport.update({
  id: "/token",
  path: "/token",
  getParentRoute: () => rootRoute,
} as any);

const TokenDetailsRoute = TokenDetailsImport.update({
  id: "/token/$tokenAddress",
  path: "/token/$tokenAddress",
  getParentRoute: () => rootRoute,
} as any);

const AgentCreateRoute = AgentCreateImport.update({
  id: "/agent/create",
  path: "/agent/create",
  getParentRoute: () => rootRoute,
} as any);

const AgentsRoute = AgentsImport.update({
  id: "/agent",
  path: "/agent",
  getParentRoute: () => rootRoute,
} as any);

const AgentDetailsRoute = AgentDetailsImport.update({
  id: "/agent/$agentId",
  path: "/agent/$agentId",
  getParentRoute: () => rootRoute,
} as any);


const TokenCreateRoute = TokenCreateImport.update({
  id: "/token/create",
  path: "/token/create",
  getParentRoute: () => rootRoute,
} as any);



// Populate the FileRoutesByPath interface

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {
    "/": {
      id: "/";
      path: "/";
      fullPath: "/";
      preLoaderRoute: typeof IndexImport;
      parentRoute: typeof rootRoute;
    };
    "/token/$tokenAddress": {
      id: "/token/$tokenAddress";
      path: "/token/$tokenAddress";
      fullPath: "/token/$tokenAddress";
      preLoaderRoute: typeof TokenDetailsImport;
      parentRoute: typeof rootRoute;
    };
    "/token": {
      id: "/token";
      path: "/token";
      fullPath: "/token";
      preLoaderRoute: typeof TokenImport;
      parentRoute: typeof rootRoute;
    };
    "/agent/create": {
      id: "/agent/create";
      path: "/agent/create";
      fullPath: "/agent/create";
      preLoaderRoute: typeof AgentCreateImport;
      parentRoute: typeof rootRoute;
    };
    "/agent": {
      id: "/agent";
      path: "/agent";
      fullPath: "/agent";
      preLoaderRoute: typeof AgentsImport;
      parentRoute: typeof rootRoute;
    };
    "/token/create": {
      id: "/token/create";
      path: "/token/create";
      fullPath: "/token/create";
      preLoaderRoute: typeof TokenCreateImport;
    };
    "/agent/$agentId": {
      id: "/agent/$agentId";
      path: "/agent/$agentId";
      fullPath: "/agent/$agentId";
      preLoaderRoute: typeof AgentDetailsImport;
      parentRoute: typeof rootRoute;
    };
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  "/": typeof IndexRoute;
  "/token/$tokenAddress": typeof TokenDetailsRoute;
  "/token": typeof TokenRoute;
  "/agent/create": typeof AgentCreateRoute;
  "/agent": typeof AgentsRoute;
  "/token/create": typeof TokenCreateRoute;
  "/agent/$agentId": typeof AgentDetailsRoute;
}

export interface FileRoutesByTo {
  "/": typeof IndexRoute;
  "/token/$tokenAddress": typeof TokenDetailsRoute;
  "/token": typeof TokenRoute;
  "/agent/create": typeof AgentCreateRoute;
  "/agent": typeof AgentsRoute;
  "/token/create": typeof TokenCreateRoute;
  "/agent/$agentId": typeof AgentDetailsRoute;
}

export interface FileRoutesById {
  __root__: typeof rootRoute;
  "/": typeof IndexRoute;
  "/token/$tokenAddress": typeof TokenDetailsRoute;
  "/token": typeof TokenRoute;
  "/agent/create": typeof AgentCreateRoute;
  "/agent": typeof AgentsRoute;
  "/token/create": typeof TokenCreateRoute;
  "/agent/$agentId": typeof AgentDetailsRoute;
}

export type FileRouteTypes = {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths: "/" | "/token/$tokenAddress" | "/token" | "/agent" | "/agent/create" | "/token/create" | "/agent/$agentId";
  fileRoutesByTo: FileRoutesByTo;
  to: "/" | "/token/$tokenAddress" | "/token" | "/agent" | "/agent/create" | "/token/create" | "/agent/$agentId";
  id: "__root__" | "/" | "/token/$tokenAddress" | "/token" | "/agent" | "/agent/create" | "/token/create" | "/agent/$agentId";
  fileRoutesById: FileRoutesById;
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute;
  TokenRoute: typeof TokenRoute;
  TokenDetailsRoute: typeof TokenDetailsRoute;
  AgentCreateRoute: typeof AgentCreateRoute;
  AgentsRoute: typeof AgentsRoute;
  TokenCreateRoute: typeof TokenCreateRoute;
  AgentDetailsRoute: typeof AgentDetailsRoute;
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  TokenRoute: TokenRoute,
  TokenDetailsRoute: TokenDetailsRoute,
  AgentCreateRoute: AgentCreateRoute,
  AgentsRoute: AgentsRoute,
  TokenCreateRoute: TokenCreateRoute,
  AgentDetailsRoute: AgentDetailsRoute,
};

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>();