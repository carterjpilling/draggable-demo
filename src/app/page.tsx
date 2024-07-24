"use client";

import { useState, useRef, useEffect } from "react";

interface Point {
  id: number;
  x: number;
  y: number;
}

const Home = () => {
  const initialDots: Point[] = [
    { id: 1, x: 200, y: 100 }, // Pitcher's mound
    { id: 2, x: 300, y: 150 }, // 1st base
    { id: 400, x: 200, y: 150 }, // 2nd base
    { id: 4, x: 300, y: 250 }, // 3rd base
    { id: 5, x: 200, y: 250 }, // Home plate
    { id: 6, x: 150, y: 200 }, // Left field
    { id: 7, x: 200, y: 75 }, // Catcher (Behind home plate)
    { id: 8, x: 250, y: 200 }, // Shortstop
    { id: 9, x: 250, y: 100 }, // 2nd baseman
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
        <circle cx={250} cy={250} r={5} fill="white" stroke="black" />
        <circle cx={400} cy={325} r={5} fill="white" stroke="black" />
        <circle cx={250} cy={442.5} r={5} fill="white" stroke="black" />
        <circle cx={100} cy={325} r={5} fill="white" stroke="black" />
        {/* <circle cx={200} cy={250} r={5} fill="black" /> */}

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
