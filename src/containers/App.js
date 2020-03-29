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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      xIsNext: true,
      stepNumber: 0,
      history: [
        {squares: Array(9).fill(null)}
      ],
      handshake: false,
      logs: [],
      isLogUpdating: false
    };
  }

  jumpTo(step) {
    axios.post(baseUrl + '/api/log', {
      id: guestId,
      action: 'Jumped to step: ' + step
    })
      .then(() => {
        return this.updateLogs();
      });
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
          return this.updateLogs();
        })
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

  updateLogs() {
    this.setState({
      ...this.state,
      isLogUpdating: true
    });
    axios.get(baseUrl + '/api/list?id=' + guestId)
      .then(response => {
        this.setState({
          ...this.state,
          logs: response.data.data,
          isLogUpdating: false
        })
      });
  }

  componentDidMount() {
    if (!guestId) {
      Swal.fire({
        onBeforeOpen: () => {
          Swal.showLoading();
        },
        html: 'Please wait while the app connects with server',
        allowOutsideClick: false
      });
      socket.on('handshake', (data) => {
        Swal.close();
        this.setState({
          ...this.state,
          handshake: true
        });
        guestId = data;
        localStorage.setItem('id', data);
      })
    } else {
      this.setState({
        ...this.state,
        handshake: true
      });
    }
  }

  resetGame() {
    localStorage.clear();
    window.location.reload();
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
          <br/><br/>
          <button className="reset-button" onClick={this.resetGame}>RESET GAME</button>
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
          <div className="logs">
            <div><strong>Logs of the game are below:</strong></div>
            {this.state.logs.length === 0 && this.state.isLogUpdating === false ? (
              <div>No logs to show</div>) : this.state.logs.map(log => (
              <div key={log._id}>{log.action}</div>
            ))}
            {this.state.isLogUpdating ? (<div>Updating Logs ...</div>) : (<div>{' '}</div>)}
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
