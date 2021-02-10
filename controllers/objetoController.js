import models from "../models";
import fs from "fs";
import parser from "xml2json";
import { io } from "socket.io-client";

export default {
  crear: async (req, res, next) => {
    try {
      console.log("req.body: ", req.body);
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
        reg = JSON.parse(parser.toJson(data, { reversible: true })).objetos
          .objeto;
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
      fs.readFile(process.env.DATABASE_URL, function (err, data) {
        reg = JSON.parse(parser.toJson(data, { reversible: true }));
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
        console.log("id del socket: ", socket.id);

        let reg;
        fs.readFile(process.env.DATABASE_URL, function (err, data) {
          if (data) {
            reg = JSON.parse(parser.toJson(data, { reversible: true })).objetos
              .objeto;
            socket.emit("replicar", {
              accion: req.body.accion,
              objetos: reg,
            });
          }
        });

        socket.on("respuesta", (data) => {
          console.log("esta es la respuesta", data);
        });
      });

      res.status(200).json({
        message: "Se replicó",
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
        socket.emit("restaurar");

        socket.on("respuesta", (data) => {
          console.log(data);
        });
      });

      res.status(200).json({
        message: "Se restauró",
      });
    } catch (e) {
      res.status(500).send({
        message: "Ocurrió un error",
      });
      next(e);
    }
  },
};
