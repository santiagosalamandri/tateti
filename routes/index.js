var express = require('express');
var router = express.Router();

var jugadores;
var tablero;
var turno;

const marcas = ['x', 'o'];

function isMyTurn(player) {
  return (jugadores[turno]==player);
}

function isValid(pos) {
  return (pos <= 2 && pos >= 0);
}

function isEmpty(fila, columna) {
  return (tablero[fila][columna] == ' ');
}

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.put('/empezar', function (request, response) {
  turno = 0;
  jugadores = request.body.jugadores;
  tablero = [
    [' ', ' ', ' '],
    [' ', ' ', ' '],
    [' ', ' ', ' '],
  ];

  response.setHeader('Content-Type', 'application/json');
  response.send({ turno: jugadores[turno], tablero: tablero });
});

router.put('/movimiento', function (request, response) {
  const columna = request.body.columna;
  const fila = request.body.fila;
  const jugador= request.body.jugador;
  response.setHeader('Content-Type', 'application/json');
  if(!isMyTurn(jugador)){
    response.status(403).send({ turno: jugadores[turno], tablero: tablero, error: "Turno incorrecto" })
  }
  else if (!isValid(fila) || !isValid(columna)) {
    response.status(403).send({ turno: jugadores[turno], tablero: tablero, error: "Casillero incorrecto" })
  }
  else if (!isEmpty(fila, columna)) {
    response.status(403).send({ turno: jugadores[turno], tablero: tablero, error: "Casillero Ocupado" })
  }
  else {
    tablero[fila][columna] = marcas[turno];
    turno = (turno + 1) % 2;
    response.send({ turno: jugadores[turno], tablero: tablero });
  }
});

module.exports = router;
