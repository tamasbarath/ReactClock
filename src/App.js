import React, { Component } from "react";
import Clock from "react-clock";
import Moment from "moment-timezone";
import styled from "styled-components";
import styles from './App.css';

import DigitalClock from "./digital-clock";

import { Flex, Group, Switch, Button, ButtonOutline } from "rebass";
import { getDiffieHellman } from "crypto";
import { DH_CHECK_P_NOT_PRIME } from "constants";

const Controls = Flex.extend`
  margin: 10px;
`;

const Frame = Flex.extend`
  margin: 20px;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0px 2px 8px #222;
  background-color: white;
  filter: invert(100%);
  ${Controls} {
    filter: opacity(0%);
  }
  &:hover {
    ${Controls} {
      filter: opacity(100%);
    }
  }
`;

const ClockFrame = ({ date, city, type, onClick }) => (
  <Frame flexDirection={"column"} alignItems={"center"}>
    <p style={{ margin: "5px", padding: "10px" }}>
      {city.split("/")[1].replace("_", " ")}
    </p>
    {type === "analog" && (
      <Clock size="200" renderNumbers={true} value={date.toDate()} />
    )}
    {type === "digital" && <DigitalClock size={55} time={date.format("HH:mm:ss")} />}
    <Controls justifyContent="space-around" alignItems={"center"}>
      <Group>
        {type === "analog" ? (
          <Button bg={"black"}>Analog</Button>
        ) : (
            <ButtonOutline
              onClick={() => onClick("analog")}
              color={"black"}
              hover={{ background: "black", color: "white" }}
              bg={"white"}
            >
              Analog
          </ButtonOutline>
          )}
        {type === "digital" ? (
          <Button bg={"black"}>Digital</Button>
        ) : (
            <ButtonOutline
              onClick={() => onClick("digital")}
              color={"black"}
              hover={{ background: "black", color: "white" }}
              bg={"white"}
            >
              Digital
          </ButtonOutline>
          )}
      </Group>
    </Controls>
  </Frame>
);

class App extends Component {
  state = {
    clocks: [
      {
        city: "Europe/UTC",
        offset: -1,
        type: "digital",
        date: Moment().add(-1, "hours")
      },
      {
        city: "Europe/CET",
        offset: 0,
        type: "digital",
        date: Moment().add(0, "hours")
      },
      {
        city: "Asia/IST",
        offset: +4.50,
        type: "digital",
        date: Moment().add(+4.50, "hours")
      },
     
    ]
  };

  // sets the clock stroke offset and the time text 
  updateClocksOnUI = (days, hours, mins, secs) => {
    var initialOffset = 408.40704496667312100014363982634;  // 2 * circle radius * pi = circumference

    // sets the day/hour/min/sec texts in the clocks on UI
    document.getElementById('daycounter').innerHTML = Math.floor(days);
    document.getElementById('hourcounter').innerHTML = Math.floor(hours);
    document.getElementById('minutecounter').innerHTML = Math.floor(mins);
    document.getElementById('secondcounter').innerHTML = Math.floor(secs);

    // sets the circle stroke offset according to remaining time; number means the unit (e.g. 60 = dividing into 60 parts)
    document.getElementById('circle_d').style.strokeDashoffset = initialOffset - ((7 - days) * (initialOffset / 7));
    document.getElementById('circle_h').style.strokeDashoffset = initialOffset - ((24 - hours) * (initialOffset / 24));
    document.getElementById('circle_m').style.strokeDashoffset = initialOffset - ((60 - mins) * (initialOffset / 60));
    document.getElementById('circle_s').style.strokeDashoffset = initialOffset - ((60 - secs) * (initialOffset / 60));
  }

  clockInterval = (cmpTime, cmpText, dates) => {
    var self = this;

    var interval = setInterval(function () {
      // recalculates the remaining time
      var actDate = new Date();
      var seconds = Math.floor((cmpTime - (actDate)) / 1000) + 1;
      var minutes = Math.floor(seconds / 60);
      var hours = Math.floor(minutes / 60);
      var days = Math.floor(hours / 24);

      hours = hours - (days * 24);
      minutes = minutes - (days * 24 * 60) - (hours * 60);
      seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);
      // updates clocks and clock texts on UI
      self.updateClocksOnUI(days, hours, minutes, seconds);
      document.getElementById('nextCMPText').innerHTML = cmpText;

      // time is up
      if (days == 0 && hours == 0 && minutes == 0 && seconds == 0) {
        clearInterval(interval);  // clearing current interval

        var dateOfNextCMP = self.getClosestDate(dates); // get next CMP date
        self.clockInterval(dateOfNextCMP.date, dateOfNextCMP.text, dates);  // restarts clocks with the next CMP date
      }
    }, 1000);
  }

  componentDidMount() {
    setInterval(
      () =>
        this.setState(prev => ({
          ...prev,
          clocks: prev.clocks.map((clock, n) => ({
            ...clock,
            date: Moment().add(clock.offset, "hours")
          }))
        }),
        ),
      1000
    );
    var dates = this.createCMPs();
    var dateOfNextCMP = this.getClosestDate(dates);

    document.getElementById('nextCMPText').innerHTML = dateOfNextCMP.text;
    this.clockInterval(dateOfNextCMP.date, dateOfNextCMP.text, dates);
  }

  createCMPs = () => {
    // var referenceDay = new Date("2018-11-17");
    var now = new Date();
    var referenceDay = new Date(now.setDate(now.getDate() - now.getDay() - 1)); // last saturday
    var dates = [];
    var weekNum = 1;
    for (var i = 0; i < 300; i++) {
      var date = new Date(referenceDay);
      var text = "Remaining time until ";
      switch (i % 3) {
        case 0:
          text += "APJ CMP ";
          date.setDate(referenceDay.getDate() + weekNum * 7);
          date.setHours(15, 0, 0, 0);
          break;
        case 1:
          text += "EMEA CMP ";
          date.setDate(referenceDay.getDate() + weekNum * 7);
          date.setHours(22, 0, 0, 0);
          break;
        case 2:
          text += "AMER CMP ";
          date.setDate(referenceDay.getDate() + weekNum * 7 + 1);
          date.setHours(4, 0, 0, 0);
          weekNum++;
          break;
      }
      dates.push({ "date": this.addTimeOffset(date), "text": text });
    }
    return dates;
  }

  // returns the closest date
  getClosestDate = (dates) => {
    var now = new Date();
    var closest = Infinity;

    for (var i = 0; i < dates.length; i++) {
      var date = new Date(dates[i].date);
      if (date >= now && date < closest) {
        closest = i;
      }
    }
    return dates[closest];
  }

  addTimeOffset = (date) => {
    var pushedDate = new Date(date);
    var tzo = pushedDate.getTimezoneOffset();
    return new Date(pushedDate.getTime() - tzo * 60 * 1000);
  }

  render() {
    return (
      <div className="container">
        <Flex
          justifyContent="center"
          alignItems={"left"}
          style={{ backgroundColor: "white", filter: "invert(100%)" }}
        >
          <span style={{ fontSize: "2em", margin: "10px" }}>
            Datacenter Time
          </span>
        </Flex>
        <Flex
          justifyContent="center"
          alignItems="center"
          style={{ width: "100%", height: "80%" }}>
          {this.state.clocks.map((clock, id) => (
            <ClockFrame
              key={id}
              type={clock.type}
              date={clock.date}
              city={clock.city}
              onClick={(type) => this.setState(prev => ({
                ...prev,
                clocks: prev.clocks.map((clock, idx) => idx === id ? { ...clock, type: type } : clock)
              }))}
            />
          ))}
        </Flex>
        <Flex justifyContent="center" alignItems="center" style={{ width: "100%", height: "0%" }}>
          <div id="nextCMPText" className="nextCMPText" />
        </Flex>
        <Flex
          justifyContent="center" alignItems="center" style={{ width: "100%", height: "0%" }}>
          <div class="item html">
            <h1 id="daycounter"></h1>
            <h4 style={{ marginTop: "50px" }}>days</h4>
            <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
              <g>
                <circle id="circle_d" class="circle_animation_d" r="65" cy="75" cx="75" fill="#ffffff40" stroke-width="4" stroke="#70ff57" />
              </g>
            </svg>
          </div>
          <div class="item html">
            <h1 id="hourcounter"></h1>
            <h4 style={{ marginTop: "50px" }}>hours</h4>
            <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
              <g>
                <circle id="circle_h" class="circle_animation_h" r="65" cy="75" cx="75" fill="#ffffff40" stroke-width="4" stroke="#f7ff4b" />
              </g>
            </svg>
          </div>
          <div class="item html">
            <h1 id="minutecounter"></h1>
            <h4 style={{ marginTop: "50px" }}>minutes</h4>
            <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
              <g>
                <circle id="circle_m" class="circle_animation_m" r="65" cy="75" cx="75" fill="#ffffff40" stroke-width="4" stroke="#19b2ff" />
              </g>
            </svg>
          </div>
          <div class="item html">
            <h1 id="secondcounter"></h1>
            <h4 style={{ marginTop: "50px" }}>seconds</h4>
            <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
              <g>
                <circle id="circle_s" class="circle_animation_s" r="65" cy="75" cx="75" fill="#ffffff40" stroke-width="4" stroke="#fe8e00" />
              </g>
            </svg>
          </div>
        </Flex>
      </div>

    );
  }
}

export default App;
