import './App.scss';
import React, {Component} from 'react';
import Board from './../components/Board';
import axios from 'axios';
import Swal from "sweetalert2";
const io = require('socket.io-client');

const env = 'dev';

let baseUrl = 'https://tic-tac-toe-api2.herokuapp.com';

if (env === 'dev') {
  baseUrl = 'http://localhost:3001';
}

const socket = io(baseUrl);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      xIsNext: true,
      stepNumber: 0,
      history: [
        {squares: Array(9).fill(null)}
      ]
    };
    this.handshake = false;
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    })
  }

  handleClick(i) {
    console.log(this.state.xIsNext, i);
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const winner = calculateWinner(squares);
    if (winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat({
        squares: squares
      }),
      xIsNext: !this.state.xIsNext,
      stepNumber: history.length
    });

  }

  componentDidMount() {
    Swal.fire({
      onBeforeOpen: () => {
        Swal.showLoading();
      },
      html: 'Please wait while the app connects with server',
      allowOutsideClick: false
    });
    socket.on('name', (data) => {
      Swal.close();
      this.setState({
        ...this.state,
        handshake: true
      });
      console.log(data);
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const moves = history.map((step, move) => {
      const desc = move ? 'Go to #' + move : 'Start the Game';
      return (
        <li key={move}>
          <button onClick={() => {
            this.jumpTo(move)
          }}>
            {desc}
          </button>
        </li>
      )
    });
    let status;
    if (winner) {
      status = 'Winner is ' + winner;
    } else {
      status = 'Next Player is ' + (this.state.xIsNext ? 'X' : 'O');
    }

    if (this.state.handshake) {
      return (
        <div className="game">
          <div className="game-board">
            <Board onClick={(i) => this.handleClick(i)}
                   squares={current.squares}/>
          </div>
          <div className="game-info">
            <div>{status}</div>
            <ul>{moves}</ul>
          </div>
        </div>
      )
    }
    return (<div>{''}</div>);
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[b] === squares[c]) {
      return squares[a];
    }
  }

  return null;
}

export default App;
