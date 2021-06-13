import React from "react";
import "./App.scss";
import screw from "./screw.svg";
import tomato from "./tomato.svg";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeLeft: 0,
      targetTime: null,
      sessionLength: 25 * 60 * 1000,
      breakLength: 5 * 60 * 1000,
      timerStarted: false,
      brightnessInit: 100,
      isBreak: false,
    };
    this.switchOn = this.switchOn.bind(this);
    this.modiBreakTime = this.modiBreakTime.bind(this);
    this.modiSessionTime = this.modiSessionTime.bind(this);
    this.reset = this.reset.bind(this);
    this.parseTime = this.parseTime.bind(this);
    this.sync = this.sync.bind(this);
  }
  reset = () => {
    document.getElementById("beep").pause();
    if (this.state.timerStarted) {
      this.switchOn();
    }
    this.setState(() => {
      return {
        timeLeft: 25 * 60 * 1000,
        targetTime: null,
        sessionLength: 25 * 60 * 1000,
        breakLength: 5 * 60 * 1000,
        timerStarted: false,
        brightnessInit: 100,
        isBreak: false,
      };
    });
  };
  modiSessionTime = (time) => {
    time > 0
      ? this.setState((prevState) => {
          return Object.assign({}, prevState, {
            sessionLength: Math.min(
              prevState.sessionLength + time,
              60 * 60 * 1000
            ),
          });
        })
      : this.setState((prevState) => {
          return Object.assign({}, prevState, {
            sessionLength: Math.max(prevState.sessionLength + time, 0),
          });
        });
  };
  modiBreakTime = (time) => {
    time > 0
      ? this.setState((prevState) => {
          return Object.assign({}, prevState, {
            breakLength: Math.min(prevState.breakLength + time, 60 * 60 * 1000),
          });
        })
      : this.setState((prevState) => {
          return Object.assign({}, prevState, {
            breakLength: Math.max(prevState.breakLength + time, 0),
          });
        });
  };
  sync = () => {
    this.state.isBreak
      ? this.setState((prevState) => {
          return Object.assign({}, prevState, {
            timeLeft: prevState.breakLength,
          });
        })
      : this.setState((prevState) => {
          return Object.assign({}, prevState, {
            timeLeft: prevState.sessionLength,
          });
        });
    console.log(this.state);
  };
  switchOn = () => {
    if (this.state.timerStarted) {
      // Turn OFF
      clearInterval(this.timerSpin);
      this.setState((prevState) => {
        return Object.assign({}, prevState, {
          timerStarted: false,
        });
      });
    } else {
      //  Turn ON
      this.sync();
      this.setState((prevState) => {
        return Object.assign({}, prevState, {
          targetTime: this.state.timeLeft + Date.now(),
          timerStarted: true,
        });
      });
      let step = 25;
      this.timerSpin = setInterval(() => {
        // timer spin
        this.setState((prevState) => {
          return Object.assign({}, prevState, {
            timeLeft: prevState.targetTime - Date.now(),
          });
        });
        // led blink
        if (this.state.brightnessInit >= 300) {
          step = -10;
        } else if (this.state.brightnessInit <= 50) {
          step = 25;
        }
        this.setState((prevState) => {
          return Object.assign({}, prevState, {
            brightnessInit: prevState.brightnessInit + step,
          });
        });
        document.getElementById(
          "led"
        ).style.filter = `brightness(${this.state.brightnessInit}%)`;
        // beep
        if (this.state.timeLeft <= 0) {
          // clearInterval(this.timerSpin);
          this.setState((prevState) => {
            Object.assign({}, prevState, {
              timeLeft: prevState.isBreak
                ? prevState.sessionLength
                : prevState.breakLength,
              isBreak: !prevState.isBreak,
              timerStarted:false
            });
          });
          document.getElementById("beep").play();
          this.switchOn()
        }
      }, 100);
    }
  };
  parseTime = () => {
    let min = "00";
    let sec = "00";
    min = parseInt(this.state.timeLeft / 1000 / 60);
    sec = parseInt((this.state.timeLeft / 1000) % 60);
    if (parseInt(min) < 10) {
      min = "0" + min;
    }
    if (parseInt(sec) < 10) {
      sec = "0" + sec;
    }
    return min + ":" + sec;
  };
  render() {
    let timeParsed = this.parseTime();
    return (
      <div className="App">
        <h1>
          <img src={tomato} alt="tomato" id="led" />
          Pomodoro
        </h1>
        <div id="clock-container">
          <button id="start_stop" onClick={this.switchOn}>
            <img
              src={screw}
              alt="screw"
              style={{
                transform: "rotate(" + this.state.timeLeft / 10000 + "deg)",
              }}
            />
          </button>
        </div>
        <div id="btn-group">
          <div className="btn-grp">
            <button
              id="break-decrement"
              onClick={() => this.modiBreakTime(-1000 * 60)}
              className="dec"
            ></button>
            <button
              id="break-increment"
              onClick={() => this.modiBreakTime(1000 * 60)}
              className="inc"
            ></button>
          </div>
          <div className="btn-grp single">
            <button id="reset" onClick={this.reset}>
              R
            </button>
          </div>
          <div className="btn-grp">
            <button
              id="session-decrement"
              onClick={() => this.modiSessionTime(-1000 * 60)}
              className="dec"
            ></button>
            <button
              id="session-increment"
              onClick={() => this.modiSessionTime(1000 * 60)}
              className="inc"
            ></button>
          </div>
        </div>
        <div id="label-grp">
          <div className="lbl-grp">
            <div id="break-label">Break</div>
            <div id="break-length">
              {parseInt(this.state.breakLength / 1000 / 60)}
            </div>
          </div>
          <div className="lbl-grp">
            <div id="session-label">Session</div>
            <div id="session-length">
              {parseInt(this.state.sessionLength / 1000 / 60)}
            </div>
          </div>
        </div>
        <div id="timer">
          CURRENT:
          <div id="timer-label">{this.state.isBreak ? "Break" : "Session"}</div>
          <div id="time-left">{timeParsed}</div>
        </div>
        <audio
          id="beep"
          src="https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"
        />
      </div>
    );
  }
}

export default App;
