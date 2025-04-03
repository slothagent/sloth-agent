import { Route as rootRoute } from "./routes/__root";
import { Route as IndexImport } from "./routes/index";
import { Route as TokenDetailsImport } from "./routes/token.$tokenAddress";
import { Route as TokenImport } from "./routes/token";
import { Route as AgentCreateImport } from "./routes/create-agent";
import { Route as AgentsImport } from "./routes/agents";
import { Route as TokenCreateImport } from "./routes/create-token";
import { Route as AgentDetailsImport } from "./routes/agent.$agentId";
import { Route as CategoriesImport } from "./routes/categories";  
import { Route as ProfileImport } from "./routes/profile.$address";
import { Route as OmniImport } from "./routes/omni";
import { Route as OmniChatImport } from "./routes/omni.$chatId";
import { Route as SolImport } from "./routes/sol/$tokenAddress";

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


const CategoriesRoute = CategoriesImport.update({
  id: "/categories",
  path: "/categories",
  getParentRoute: () => rootRoute,
} as any);


const ProfileRoute = ProfileImport.update({
  id: "/profile/$address",
  path: "/profile/$address",
  getParentRoute: () => rootRoute,
} as any);


const OmniRoute = OmniImport.update({
  id: "/omni",
  path: "/omni",
  getParentRoute: () => rootRoute,
} as any);

const OmniChatRoute = OmniChatImport.update({
  id: "/omni/$chatId",
  path: "/omni/$chatId",
  getParentRoute: () => rootRoute,
} as any);

const SolRoute = SolImport.update({
  id: "/sol/$tokenAddress",
  path: "/sol/$tokenAddress",
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
    "/categories": {
      id: "/categories";
      path: "/categories";
      fullPath: "/categories";
      preLoaderRoute: typeof CategoriesImport;
    };  
    "/profile/$address": {
      id: "/profile/$address";
      path: "/profile/$address";
      fullPath: "/profile/$address";
      preLoaderRoute: typeof ProfileImport;
    };  
    "/omni": {
      id: "/omni";
      path: "/omni";
      fullPath: "/omni";
      preLoaderRoute: typeof OmniImport;
    };
    "/omni/$chatId": {
      id: "/omni/$chatId";
      path: "/omni/$chatId";
      fullPath: "/omni/$chatId";
      preLoaderRoute: typeof OmniChatImport;
    };
    "/sol/$tokenAddress": {
      id: "/sol/$tokenAddress";
      path: "/sol/$tokenAddress";
      fullPath: "/sol/$tokenAddress";
      preLoaderRoute: typeof SolImport;
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
  "/categories": typeof CategoriesRoute;
  "/profile/$address": typeof ProfileRoute;
  "/omni": typeof OmniRoute;
  "/omni/$chatId": typeof OmniChatRoute;
  "/sol/$tokenAddress": typeof SolRoute;
}

export interface FileRoutesByTo {
  "/": typeof IndexRoute;
  "/token/$tokenAddress": typeof TokenDetailsRoute;
  "/token": typeof TokenRoute;
  "/agent/create": typeof AgentCreateRoute;
  "/agent": typeof AgentsRoute;
  "/token/create": typeof TokenCreateRoute;
  "/agent/$agentId": typeof AgentDetailsRoute;
  "/categories": typeof CategoriesRoute;
  "/profile/$address": typeof ProfileRoute;
  "/omni": typeof OmniRoute;
  "/omni/$chatId": typeof OmniChatRoute;
  "/sol/$tokenAddress": typeof SolRoute;
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
  "/categories": typeof CategoriesRoute;
  "/profile/$address": typeof ProfileRoute;
  "/omni": typeof OmniRoute;
  "/omni/$chatId": typeof OmniChatRoute;
  "/sol/$tokenAddress": typeof SolRoute;
}

export type FileRouteTypes = {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths: "/" | "/token/$tokenAddress" | "/token" | "/agent" | "/agent/create" | "/token/create" | "/agent/$agentId" | "/categories" | "/profile/$address" | "/omni" | "/omni/$chatId" | "/sol/$tokenAddress";
  fileRoutesByTo: FileRoutesByTo;
  to: "/" | "/token/$tokenAddress" | "/token" | "/agent" | "/agent/create" | "/token/create" | "/agent/$agentId" | "/categories" | "/profile/$address" | "/omni" | "/omni/$chatId" | "/sol/$tokenAddress";
  id: "__root__" | "/" | "/token/$tokenAddress" | "/token" | "/agent" | "/agent/create" | "/token/create" | "/agent/$agentId" | "/categories" | "/profile/$address" | "/omni" | "/omni/$chatId" | "/sol/$tokenAddress";
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
  CategoriesRoute: typeof CategoriesRoute;
  ProfileRoute: typeof ProfileRoute;
  OmniRoute: typeof OmniRoute;
  OmniChatRoute: typeof OmniChatRoute;
  SolRoute: typeof SolRoute;
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  TokenRoute: TokenRoute,
  TokenDetailsRoute: TokenDetailsRoute,
  AgentCreateRoute: AgentCreateRoute,
  AgentsRoute: AgentsRoute,
  TokenCreateRoute: TokenCreateRoute,
  AgentDetailsRoute: AgentDetailsRoute,
  CategoriesRoute: CategoriesRoute,
  ProfileRoute: ProfileRoute,
  OmniRoute: OmniRoute,
  OmniChatRoute: OmniChatRoute,
  SolRoute: SolRoute,
};

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>();