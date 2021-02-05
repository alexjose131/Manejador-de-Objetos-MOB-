import models from "../models";
// import db from "../statics/database.xml";
import fs from "fs";
import convert from "xml-js";

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

      // logica para consultar en XML
      let reg = "";

      const xml = fs.readFileSync(
        "C:/Users/Thony/OneDrive/Escritorio/Respaldo-Anthony-febrero_2020/Documentos/UCAB/9no semestre/Sistemas distribuidos/Proyecto 2/servidor_de_aplicacion/Manejador-de-Objetos-MOB-/statics/database.xml"
      );

      reg = convert.xml2json(xml, { compact: true, spaces: 4 });

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
