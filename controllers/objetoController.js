import models from "../models";
export default {
  crear: async (req, res, next) => {
    try {
      console.log("req.body: ", req.body);
      const reg = 0;
      // logica para insertar en XML
      res.status(200).json(reg);
    } catch (e) {
      res.status(500).send({
        message: "Ocurrió un error",
      });
      next(e);
    }
  },
  consultar: async (req, res, next) => {
    try {
      console.log("req.body: ", req.body);
      const reg = {
        valor1: "ok"
      };
      // logica para consultar en XML
      res.status(200).json(reg);
    } catch (e) {
      res.status(500).send({
        message: "Ocurrió un error",
      });
      next(e);
    }
  },
  eliminar: async (req, res, next) => {
    try {
      console.log("req.body: ", req.body);
      const reg = 0;
      // logica para eliminar en XML
      res.status(200).json(reg);
    } catch (e) {
      res.status(500).send({
        message: "Ocurrió un error",
      });
      next(e);
    }
  },
  replicar: async (req, res, next) => {
    try {
      console.log("req.body: ", req.body);
      const reg = 0;
      // logica para replicar en XML
      res.status(200).json(reg);
    } catch (e) {
      res.status(500).send({
        message: "Ocurrió un error",
      });
      next(e);
    }
  },
  restaurar: async (req, res, next) => {
    try {
      console.log("req.body: ", req.body);
      const reg = 0;
      // logica para restaurar en XML
      res.status(200).json(reg);
    } catch (e) {
      res.status(500).send({
        message: "Ocurrió un error",
      });
      next(e);
    }
  },
};
