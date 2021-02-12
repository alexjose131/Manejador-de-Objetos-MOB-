import models from "../models";
import fs from "fs";
import parser from "xml2json";
import { io } from "socket.io-client";

export default {
  crear: async (req, res, next) => {
    try {
      let reg = [];
      fs.readFile(process.env.DATABASE_URL, function (err, data) {
        reg = JSON.parse(parser.toJson(data, { reversible: true }));
        console.log("reg: ", reg);
        if (reg.objetos && reg.objetos.objeto[1]) {
          reg.objetos.objeto.push(req.body);
        } else {
          if (reg.objetos && reg.objetos.objeto) {
            reg = {
              objetos: {
                objeto: [
                  {
                    nombre: reg.objetos.objeto.nombre,
                    fecha: reg.objetos.objeto.fecha,
                    accion: reg.objetos.objeto.accion,
                  },
                  req.body,
                ],
              },
            };
          } else {
            reg = {
              objetos: {
                objeto: [req.body],
              },
            };
          }
        }
        reg = parser.toXml(reg, { reversible: true });
        fs.writeFile(process.env.DATABASE_URL, reg, () => {});
      });

      res.status(200).json({ message: "Added succesfully." });
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
      fs.readFile(process.env.DATABASE_URL, function (err, data) {
        reg = JSON.parse(parser.toJson(data, { reversible: true }));
        if (Object.entries(reg).length === 0){
          res.status(200).send([]);
        } else if (!Array.isArray(reg.objetos.objeto)){
          res.status(200).send([reg.objetos.objeto]);
        } else {
          res.status(200).json(reg.objetos
            .objeto);
        }

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
      let reg = [];
      fs.readFile(process.env.DATABASE_URL, function (err, data) {
        reg = JSON.parse(parser.toJson(data, { reversible: true }));
        console.log(reg)
        if (!Array.isArray(reg.objetos.objeto)) {
          reg = {}
          reg = parser.toXml(reg, { reversible: true });
          fs.writeFile(process.env.DATABASE_URL, reg, () => {});
          res.status(200).json({ message: "Deleted successfully" });
        } else {
          reg.objetos.objeto.forEach((objeto, i) => {
            if (
              objeto.nombre.$t === req.body.nombre.$t &&
              objeto.fecha.$t === req.body.fecha.$t &&
              objeto.accion.$t === req.body.accion.$t
            ) {
              reg.objetos.objeto.splice(i, 1);
              reg = parser.toXml(reg, { reversible: true });
              fs.writeFile(process.env.DATABASE_URL, reg, () => {});
              res.status(200).json({ message: "Deleted successfully" });
            }
          });
        }
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
      const socket = io(
        "http://" +
          process.env.SERVER_CONTROLLER_IP +
          ":" +
          process.env.SERVER_CONTROLLER_PORT
      );

      socket.on("connect", () => {
        let reg;
        fs.readFile(process.env.DATABASE_URL, function (err, data) {
          if (data) {
            reg = JSON.parse(parser.toJson(data, { reversible: true })).objetos
              .objeto;
            socket.emit(
              "replicarObjetos",
              {
                accion: req.body.accion,
                objetos: reg,
              },
              function (response) {
                console.log("Resultado de la réplica: ", response);
                if (response === "El servidor 1 no responde" || response === "El servidor 2 no responde") {
                  res.status(200).json({
                    message: "No se replicó debido a que uno de los servidores está caído.",
                  });
                } else {
                  res.status(200).json({
                    message: "Se replicó correctamente.",
                  });
                }
                
              }
            );
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
  restaurar: async (req, res, next) => {
    try {
      const socket = io(
        "http://" +
          process.env.SERVER_CONTROLLER_IP +
          ":" +
          process.env.SERVER_CONTROLLER_PORT
      );

      socket.on("connect", () => {
        socket.emit("restaurarObjetos", function (respuestaCoor) {
          console.log("Resultado de la restauración: ", respuestaCoor);
          if (!Array.isArray(respuestaCoor.data) && typeof respuestaCoor.data !== "undefined") {
            respuestaCoor = [respuestaCoor.data]
            fs.writeFile(process.env.DATABASE_URL, parser.toXml({objetos: {objeto: respuestaCoor}}, { reversible: true }), () => {});
          } else if (typeof respuestaCoor.data !== "undefined"){
            fs.writeFile(process.env.DATABASE_URL, parser.toXml({objetos: {objeto: respuestaCoor.data}}, { reversible: true }), () => {});
          }
          if (typeof respuestaCoor.data !== "undefined") {
            res.status(200).json({
              message: "Se restauró",
              data: respuestaCoor,
            });
          } else {
            res.status(200).json({
              message: "No se restauró",
              data: null,
            });
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
};
