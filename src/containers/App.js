import './App.scss';
import React, {Component} from 'react';
import Board from './../components/Board';
import axios from 'axios';
import Swal from "sweetalert2";
import {connect} from "react-redux";

const io = require('socket.io-client');

const env = 'prod';
let guestId = localStorage.getItem('id');

let baseUrl = 'https://tic-tac-toe-api2.herokuapp.com';

if (env === 'dev') {
  baseUrl = 'http://localhost:3001';
}

const socket = io(baseUrl);

class App extends Component {
  jumpTo(step) {
    axios.post(baseUrl + '/api/log', {
      id: guestId,
      action: 'Jumped to step: ' + step
    })
      .then(() => {
        return this.updateLogs();
      });
    this.props.jumpToStep({step});
  }

  handleClick(i) {
    const player = this.props.xIsNext ? 'X' : 'O';
    let history = this.props.history.slice(0, this.props.stepNumber + 1);
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
    squares[i] = this.props.xIsNext ? 'X' : 'O';
    history = [...history, {squares}];
    this.props.updateHistory({history, stepNumber: history.length - 1});
  }

  updateLogs() {
    this.props.changeUpdateStatus();
    axios.get(baseUrl + '/api/list?id=' + guestId)
      .then(response => {
        this.props.updateLog({data: response.data.data})
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
        this.props.turnOnHandshake();
        guestId = data;
        localStorage.setItem('id', data);
      })
    } else {
      this.props.turnOnHandshake();
    }
  }

  resetGame() {
    localStorage.clear();
    window.location.reload();
  }

  render() {
    const history = this.props.history;
    const current = history[this.props.stepNumber];
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
      status = 'Next Player is ' + (this.props.xIsNext ? 'X' : 'O');
    }

    if (this.props.handshake) {
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
            {this.props.logs.length === 0 && this.props.isLogUpdating === false ? (
              <div>No logs to show</div>) : this.props.logs.map(log => (
              <div key={log._id}>{log.action}</div>
            ))}
            {this.props.isLogUpdating ? (<div>Updating Logs ...</div>) : (<div>{' '}</div>)}
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

const mapStateToProps = (state) => {
  return {
    xIsNext: state.xIsNext,
    stepNumber: state.stepNumber,
    history: state.history,
    handshake: state.handshake,
    logs: state.logs,
    isLogUpdating: state.isLogUpdating
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    jumpToStep: (payload) => dispatch({type: 'JUMP_TO', payload}),
    turnOnHandshake: () => dispatch({type: 'HANDSHAKE'}),
    updateLog: (payload) => dispatch({type: 'UPDATE_LOG', payload}),
    changeUpdateStatus: () => dispatch({type: 'UPDATE_STATUS'}),
    updateHistory: (payload) => dispatch({type: 'UPDATE_HISTORY', payload})
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
