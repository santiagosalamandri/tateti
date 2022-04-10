var express = require('express');
var router = express.Router();

var jugadores;
var tablero;
var turno;
var hayGanador;
var numMovimientos;
const marcas = ['x', 'o'];
const MAX_MOVIMIENTOS = 9

function isTie() {
  return (estado == 'No Terminado' && isFull() == true);
}
function isFull() {
  return (numMovimientos == MAX_MOVIMIENTOS);
}
function checkWinner() {
  //console.log(tablero);

  for (let column = 0; column < 3; column++) {  //check column
    if (tablero[0][column] == tablero[1][column] && tablero[1][column] == tablero[2][column] && tablero[2][column]!=' ') {
      console.log("TATETI COLUMNA "+column);
      return true;
    }
  }
  for (let fila = 0; fila < 3; fila++) {  //check row
    if (tablero[fila][0] == tablero[fila][1] && tablero[fila][1] == tablero[fila][2]&& tablero[fila][2]!=' ') {
      console.log("TATETI FILA "+fila);
      return true;
    }
  }
  //check diagonal
  if (((tablero[0][0] == tablero[1][1] && tablero[1][1] == tablero[2][2])&& tablero[2][2]!=' ') 
  || 
  ((tablero[0][2] == tablero[1][1] && tablero[1][1] == tablero[2][0])&& tablero[2][0]!=' ')) {
    console.log("TATETI DIAGONAL");
    return true;
  }
  return false
}
function isMyTurn(player) {
  return (jugadores[turno] == player);
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
  numMovimientos=0;
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
  const jugador = request.body.jugador;
  response.setHeader('Content-Type', 'application/json');
  if (!isMyTurn(jugador)) {
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
    hayGanador = checkWinner();
    numMovimientos =numMovimientos+ 1;
    console.log('hayGanador '+hayGanador);

    if (!hayGanador) {

      console.log('numMovimientos '+numMovimientos)
      estado = (isFull()==true )? 'Terminado. Empate' : 'No terminado'
      response.send({ turno: jugadores[turno], tablero: tablero, estado: estado });
    } else {
      estado='Terminado';
      response.send({ turno: jugadores[turno], tablero: tablero, estado: estado, ganador: jugador });
    }
  }
});

module.exports = router;
