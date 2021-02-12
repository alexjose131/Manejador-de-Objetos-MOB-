import models from "../models";
import fs from "fs";
import parser from "xml2json";
import { io } from "socket.io-client";

export default {
  //se crea el objeto
  crear: async (req, res, next) => {
    try {
      let reg = [];
      //se lee el XML parseandolo a JSON
      fs.readFile(process.env.DATABASE_URL, function (err, data) {
        reg = JSON.parse(parser.toJson(data, { reversible: true }));
        console.log("reg: ", reg);
        //se estructura los datos para guardarlos
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
        //se parsea el JSON a XML
        reg = parser.toXml(reg, { reversible: true });
        //se escribe en el XML
        fs.writeFile(process.env.DATABASE_URL, reg, () => {});
      });
      // se envia agregado en caso de que todo este bien
      res.status(200).json({ message: "Added succesfully." });
    } catch (e) {
      res.status(500).send({
        message: "Ocurrió un error",
      });
      next(e);
    }
  },
  //se consulta el objeto
  consultar: async (req, res, next) => {
    try {
      let reg;
      //se lee el XML, se parsea a JSON y se envia al cliente
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
  //se elimina el objeto
  eliminar: async (req, res, next) => {
    try {
      let reg = [];
      //se lee del XML y se parsea a JSON
      fs.readFile(process.env.DATABASE_URL, function (err, data) {
        reg = JSON.parse(parser.toJson(data, { reversible: true }));
        console.log(reg)
        //se busca en el JSON el objeto a eliminar, se parsea de JSON a XML y se actualiza
        if (!Array.isArray(reg.objetos.objeto)) {
          reg = {}
          reg = parser.toXml(reg, { reversible: true });
          //escritura en XML
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
              //escritura en XML
              fs.writeFile(process.env.DATABASE_URL, reg, () => {});
              //se envia eliminado en caso de que todo este bien
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
  //se replican todos los objetos del XML
  replicar: async (req, res, next) => {
    try {
      const socket = io(
        "http://" +
          process.env.SERVER_CONTROLLER_IP +
          ":" +
          process.env.SERVER_CONTROLLER_PORT
      );
      //se conecta al Servidor Coordinador
      socket.on("connect", () => {
        let reg;
        // se lee del archivo XML y se parsea a JSON
        fs.readFile(process.env.DATABASE_URL, function (err, data) {
          if (data) {
            reg = JSON.parse(parser.toJson(data, { reversible: true })).objetos
              .objeto;
            //se Llama a replicarObjetos(), este devuelve una respuesta
            socket.emit(
              "replicarObjetos",
              {
                accion: req.body.accion,
                objetos: reg,
              },
              //respuesta del coordinador
              function (response) {
                console.log("Resultado de la réplica: ", response);
                //si alguno de los servidores de replicacion no respodieron al coordinador, entra
                if (response === "El servidor 1 no responde" || response === "El servidor 2 no responde") {
                  res.status(200).json({
                    message: "No se replicó debido a que uno de los servidores está caído.",
                  });
                //si devolvio GLOBAL_ABORT entra
                } if (response === false) {
                  res.status(200).json({
                    message: "No se replicó debido a que uno de los servidores negó la petición.",
                  });
                }
                //si replica, entra
                else {
                  //envia el mensaje en caso de que todo sea correcto
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
  //se restauran todos los objetos
  restaurar: async (req, res, next) => {
    try {
      const socket = io(
        "http://" +
          process.env.SERVER_CONTROLLER_IP +
          ":" +
          process.env.SERVER_CONTROLLER_PORT
      );
      // se conecta al coordinador
      socket.on("connect", () => {
        //se llama a restauraObjetos() este devuelve una respuestaCoor
        socket.emit("restaurarObjetos", function (respuestaCoor) {
          console.log("Resultado de la restauración: ", respuestaCoor);
          //si solo viene un objeto, se pasa como array, entra aca
          if (!Array.isArray(respuestaCoor.data) && typeof respuestaCoor.data !== "undefined") {
            respuestaCoor = [respuestaCoor.data]
            fs.writeFile(process.env.DATABASE_URL, parser.toXml({objetos: {objeto: respuestaCoor}}, { reversible: true }), () => {});
          //si viene mas de un objeto entra aca
          } else if (typeof respuestaCoor.data !== "undefined"){
            fs.writeFile(process.env.DATABASE_URL, parser.toXml({objetos: {objeto: respuestaCoor.data}}, { reversible: true }), () => {});
          }
          //envia mensaje si esta todo bien, con los datos restaurados
          if (typeof respuestaCoor.data !== "undefined") {
            res.status(200).json({
              message: "Se restauró",
              data: respuestaCoor,
            });
          //si no se restauro, entra aca
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
