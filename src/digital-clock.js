import React from "react";
import styled from "styled-components";

const Digit = styled("div")`
  display: grid;
  width: ${props => props.size}px;
  height: ${props => props.size * 2}px;
  margin: 5px;
  grid-template-rows: repeat(7, 1fr);
  grid-template-columns: repeat(5, 1fr);
`;

const Dots = (size) => (
  <Digit size={size}>
    <div className="segment du" />
    <div className="segment dl" />
  </Digit>
);

const Zero = (size) => (
  <Digit size={size}>
    <div className="segment mu" />
    <div className="segment ru" />
    <div className="segment lu" />
    <div className="segment rl" />
    <div className="segment ll" />
    <div className="segment mb" />
  </Digit>
);

const One = (size) => (
  <Digit size={size}>
    <div className="segment ru" />
    <div className="segment rl" />
  </Digit>
);

const Two = (size) => (
  <Digit size={size}>
    <div className="segment mu" />
    <div className="segment ru" />
    <div className="segment mm" />
    <div className="segment ll" />
    <div className="segment mb" />
  </Digit>
);

const Three = (size) => (
  <Digit size={size}>
    <div className="segment mu" />
    <div className="segment ru" />
    <div className="segment mm" />
    <div className="segment rl" />
    <div className="segment mb" />
  </Digit>
);

const Four = (size) => (
  <Digit size={size}>
    <div className="segment ru" />
    <div className="segment lu" />
    <div className="segment mm" />
    <div className="segment rl" />
  </Digit>
);

const Five = (size) => (
  <Digit size={size}>
    <div className="segment mu" />
    <div className="segment lu" />
    <div className="segment mm" />
    <div className="segment rl" />
    <div className="segment mb" />
  </Digit>
);

const Six = (size) => (
  <Digit size={size}>
    <div className="segment mu" />
    <div className="segment lu" />
    <div className="segment mm" />
    <div className="segment ll" />
    <div className="segment rl" />
    <div className="segment mb" />
  </Digit>
);

const Seven = (size) => (
  <Digit size={size}>
    <div className="segment mu" />
    <div className="segment ru" />
    <div className="segment rl" />
  </Digit>
);

const Eight = (size) => (
  <Digit size={size}>
    <div className="segment mu" />
    <div className="segment ru" />
    <div className="segment lu" />
    <div className="segment mm" />
    <div className="segment rl" />
    <div className="segment ll" />
    <div className="segment mb" />
  </Digit>
);

const Nine = (size) => (
  <Digit size={size}>
    <div className="segment mu" />
    <div className="segment ru" />
    <div className="segment lu" />
    <div className="segment mm" />
    <div className="segment rl" />
    <div className="segment mb" />
  </Digit>
);

const numbers = {
  ":": Dots,
  "0": Zero,
  "1": One,
  "2": Two,
  "3": Three,
  "4": Four,
  "5": Five,
  "6": Six,
  "7": Seven,
  "8": Eight,
  "9": Nine
};

const DigitalClock = ({ time, size }) => {
  return (
    <div className="digits-container">
      {time.split("").map(letter => numbers[letter](size))}
    </div>
  );
};

export default DigitalClock;
