"use client";

import { useState, useRef, useEffect } from "react";

interface Point {
  id: number;
  x: number;
  y: number;
}

const Home = () => {
  const initialDots: Point[] = [
    { id: 1, x: 250, y: 318 }, // P
    { id: 2, x: 250, y: 420 }, // C
    { id: 3, x: 390, y: 300 }, // 1B
    { id: 4, x: 315, y: 250 }, // 2B
    { id: 5, x: 110, y: 300 }, // 3B
    { id: 6, x: 185, y: 250 }, // SS
    { id: 7, x: 125, y: 215 }, // LF
    { id: 8, x: 250, y: 165 }, // CF
    { id: 9, x: 375, y: 215 }, // RF
  ];

  const [dots] = useState<Point[]>(initialDots);
  const [lineEnd, setLineEnd] = useState<Point | null>(null);
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentDot, setCurrentDot] = useState<Point | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (currentDot && lineEnd) {
        const svg = svgRef.current;
        if (svg) {
          const point = svg.createSVGPoint();
          point.x = e.clientX;
          point.y = e.clientY;
          const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());

          setLineEnd({ id: currentDot.id, x: svgPoint.x, y: svgPoint.y });
        }
      }
    };

    const handleMouseUp = () => {
      if (lineEnd) {
        const foundDot = dots.find(
          (dot) =>
            Math.abs(dot.x - lineEnd.x) < 20 && Math.abs(dot.y - lineEnd.y) < 20
        );
        if (foundDot && currentDot && foundDot.id !== currentDot.id) {
          setSequence((prevSequence) => [...prevSequence, foundDot.id]);
          setCurrentDot(foundDot);
          setLineEnd(foundDot);
        } else {
          setLineEnd(null);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [currentDot, lineEnd, dots]);

  const handleMouseDown = (dot: Point) => {
    if (!currentDot) {
      setCurrentDot(dot);
      setSequence([dot.id]);
      setLineEnd({ id: dot.id, x: dot.x, y: dot.y });
    } else if (lineEnd) {
      setLineEnd(null);
      setCurrentDot(dot);
      setSequence((prevSequence) => [...prevSequence, dot.id]);
    } else if (dot === currentDot) {
      setLineEnd(dot);
    }
  };

  const handleReset = () => {
    setSequence([]);
    setCurrentDot(null);
    setLineEnd(null);
  };

  return (
    <div>
      <svg
        ref={svgRef}
        width="500"
        height="500"
        style={{ border: "1px solid black" }}
      >
        {/* Baseball diamond */}
        <rect x="50" y="50" width="400" height="400" fill="green" />
        <polygon
          points="250,250 400,325 250,445 100,325"
          fill="saddlebrown"
          stroke="black"
        />
        {/* <polygon points="250,50 400,150 250,250" fill="green" stroke="black" /> */}
        {/* <polygon points="250,250 100,150 250,50" fill="green" stroke="black" /> */}
        <rect
          x={395}
          y={320}
          width="10"
          height="10"
          fill="white"
          stroke="black"
          id="1st-base"
        />
        <rect
          x={245}
          y={245}
          width="10"
          height="10"
          fill="white"
          stroke="black"
          id="2nd-base"
        />

        <rect
          x={95}
          y={320}
          width="10"
          height="10"
          fill="white"
          stroke="black"
          id="3rd-base"
        />
        <polygon
          points="243,435 257,435 257,440 250,446 243,440"
          fill="white"
          stroke="black"
          id="home-plate"
        />
        {/* <circle cx={250} cy={442.5} r={5} fill="white" stroke="black" id="4" /> */}
        {/* <circle cx={200} cy={250} r={5} fill="black" /> */}

        <rect
          x="245"
          y="330"
          width="10"
          height="5"
          fill="white"
          stroke="black"
          id="pitchers-mound"
        />
        <line
          x1={100}
          y1={325}
          x2={51}
          y2={285}
          stroke="black"
          id="left-field-line"
        />
        <line
          x1={400}
          y1={325}
          x2={450}
          y2={285}
          stroke="black"
          id="right-field-line"
        />

        {/* <path
          x1={125}
          y1={175}
          x2={375}
          y2={175}
          d="M 125 175 Q 250 50 375 175"
          stroke="black"
          id="outfield-curve"
        /> */}

        <path
          d="M 125,175 Q 250,100 375,175"
          stroke="black"
          fill="transparent"
          id="outfield-curve"
        />

        <line
          x1={51}
          y1={220}
          x2={125}
          y2={175}
          stroke="black"
          id="left-outfield-line"
        />
        <line
          x1={375}
          y1={175}
          x2={449}
          y2={220}
          stroke="black"
          id="right-outfield-line"
        />
        {/* Dots */}
        {dots.map((dot) => (
          <circle
            key={dot.id}
            cx={dot.x}
            cy={dot.y}
            r="10"
            fill={dot.id === currentDot?.id ? "black" : "blue"}
            onMouseDown={() => handleMouseDown(dot)}
          />
        ))}

        {/* Lines for sequence */}
        {sequence.length > 1 &&
          sequence.slice(1).map((id, index) => {
            const startDot = dots.find((dot) => dot.id === sequence[index])!;
            const endDot = dots.find((dot) => dot.id === id)!;
            return (
              <line
                key={index}
                x1={startDot.x}
                y1={startDot.y}
                x2={endDot.x}
                y2={endDot.y}
                stroke="black"
              />
            );
          })}
        {currentDot && lineEnd && (
          <line
            x1={currentDot.x}
            y1={currentDot.y}
            x2={lineEnd.x}
            y2={lineEnd.y}
            stroke="black"
          />
        )}
      </svg>
      <div>
        <p>Sequence: {sequence.join(", ")}</p>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
};

export default Home;
