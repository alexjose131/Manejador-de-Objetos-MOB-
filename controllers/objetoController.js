import models from "../models";
import fs from "fs";
import parser from "xml2json";

export default {
  crear: async (req, res, next) => {
    try {
      console.log("req.body: ", req.body);
      let reg = [];
      fs.readFile("statics/database.xml", function (err, data) {
        reg = JSON.parse(parser.toJson(data, { reversible: true }));
        reg.objetos.objeto.push(req.body);
        reg = parser.toXml((reg), {reversible: true});
        fs.writeFile("statics/database.xml", reg, () => {});
      });

      res.status(200).json({message: "Added succesfully."});
    } catch (e) {
      res.status(500).send({
        message: "Ocurrió un error",
      });
      next(e);
    }
  },
  consultar: async (req, res, next) => {
    try {
      let reg;
      fs.readFile("statics/database.xml", function (err, data) {
        reg = JSON.parse(parser.toJson(data, { reversible: true })).objetos.objeto;
        res.status(200).json(reg);
      });

    } catch (e) {
      res.status(500).send({
        message: "Ocurrió un error",
      });
      next(e);
    }
  },
  eliminar: async (req, res, next) => {
    try {
      let reg = 0;
      fs.readFile("statics/database.xml", function (err, data) {
         reg = JSON.parse(parser.toJson(data, { reversible: true }));
         reg.objetos.objeto.forEach((objeto, i) => {
           if (objeto.nombre.$t=== req.body.nombre.$t && objeto.fecha.$t === req.body.fecha.$t && objeto.accion.$t === req.body.accion.$t) {
            reg.objetos.objeto.splice(i,1);
            reg = parser.toXml((reg), {reversible: true});
            fs.writeFile("statics/database.xml", reg, () => {});
            res.status(200).json({message: "Deleted successfully"});
           }
         });

      });

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
