import routerx from "express-promise-router";
import ObjetoController from "../controllers/objetoController";

const router = routerx();

//rutas a consultar por el cliente, usando REST
router.post("/crear", ObjetoController.crear);
router.get("/consultar", ObjetoController.consultar);
router.delete("/eliminar", ObjetoController.eliminar);
router.post("/replicar", ObjetoController.replicar);
router.get("/restaurar", ObjetoController.restaurar);

export default router;
