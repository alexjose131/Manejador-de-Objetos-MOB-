import routerx from "express-promise-router";
import ObjetoRouter from "./objeto";

const router = routerx();

//ruta principal
router.use("/objeto", ObjetoRouter);

export default router;
