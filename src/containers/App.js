import './App.scss';
import React, {Component} from 'react';
import Board from './../components/Board';
import axios from 'axios';
import Swal from "sweetalert2";

const io = require('socket.io-client');

const env = 'prod';
let guestId = localStorage.getItem('id');

let baseUrl = 'https://tic-tac-toe-api2.herokuapp.com';

if (env === 'dev') {
  baseUrl = 'http://localhost:3001';
}

const socket = io(baseUrl);
let logs = [];

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
    const player = this.state.xIsNext ? 'X' : 'O';
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const winner = calculateWinner(squares);

    if (squares[i] === null && winner == null) {
      axios.post(baseUrl + '/api/log', {
        id: guestId,
        action: 'Player ' + player + ' clicked on cell ' + i
      })
        .then(() => {
          return axios.get(baseUrl + '/api/list?id=' + guestId)
        })
        .then(response => {
          logs = response.data.data;
          console.log(logs);
        });
    }

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
    if (!guestId) {
      console.log('No guest Id found');
      Swal.fire({
        onBeforeOpen: () => {
          Swal.showLoading();
        },
        html: 'Please wait while the app connects with server',
        allowOutsideClick: false
      });
      socket.on('handshake', (data) => {
        console.log('Handshake is completed with socketId: ' + data);
        Swal.close();
        this.setState({
          ...this.state,
          handshake: true
        });
        guestId = data;
        localStorage.setItem('id', data);
      })
    } else {
      console.log('Guest Id found');
      this.setState({
        ...this.state,
        handshake: true
      });
    }
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
          <br/><br/><br/>
          <div className="top-row">
            <div className="game-board">
              <Board onClick={(i) => this.handleClick(i)}
                     squares={current.squares}/>
            </div>
            <div className="game-info">
              <div>{status}</div>
              <ul>{moves}</ul>
            </div>
          </div>
          <br/><br/>
          <div className="logs"><strong>Logs of the game are below:</strong></div>
          {logs.map(log => (
            <div key={log._id}>{log.action}</div>
          ))}
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
