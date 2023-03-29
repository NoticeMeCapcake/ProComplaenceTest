import { Counter } from "./components/Counter";
import { FetchData } from "./components/FetchData";
import { Home } from "./components/Home";
import {Overseer} from "./components/Overseer";

const AppRoutes = [
  {
    index: true,
    element: <Home />
  },
  {
    path: "/overseer/:id",
    id: 16,
    element: <Overseer />
  },
  {
    path: '/counter',
    element: <Counter />
  },
  {
    path: '/fetch-data',
    element: <FetchData />
  }
];

export default AppRoutes;
