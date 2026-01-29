import React, { useRef, useState, useCallback, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useAdminMode } from "@/hooks/useAdminMode";
import { MapNode, Building } from "@/types/navigation";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PathOverlay } from "../../PathOverlay";
import { ConnectionLayer } from "../../ConnectionLayer";
import { NodeLayer } from "../../NodeLayer";
import { useBlockNavigation } from "@/hooks/useBlockNavigation";

interface MapCanvasProps {
  width?: number;
  height?: number;
}

const SVG_WIDTH = 1000;
const SVG_HEIGHT = 600;

export function EngineeringMap({ width = 1000, height = 600 }: MapCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const {
    nodes,
    startNode,
    endNode,
    currentPath,
    nodesOnCurrentFloor,
    setStartNode,
    setEndNode,
    currentFloor,
  } = useBlockNavigation();

  const {
    isAdminMode,
    selectedNode,
    isConnecting,
    connectionStart,
    selectNode,
    handleMapClick,
    createNodeAtPosition,
  } = useAdminMode();

  const getFloorStyle = (floor: number) => {
    switch (floor) {
      case 0:
        return `
<style>
  .st0{stroke-width:1.39px}
  .st0,.st1,.st2,.st3,.st4,.st5,.st6{
    fill:none;
    stroke:#707071;
    stroke-miterlimit:10;
  }
  .st1{stroke-width:8.34px}
  .st2{stroke-width:8.38px}
  .st3{stroke-width:1.31px}
  .st4{stroke-width:1.23px}
  .st5{stroke-width:1.75px}
  .st6{stroke-width:1.48px}
</style>
`;

      case 1:
        return `
       .st0 { stroke-width: 6.52px; }
        .st0, .st1, .st2 {
          fill: none;
          stroke: #707071;
          stroke-miterlimit: 10;
        }
        .st1 { stroke-width: 2.47px; }
        .st2 { stroke-width: 2.48px; }
       
      `;
      case 2:
        return `
         .st0 {
        stroke-width: 2.48px;
      }

      .st0, .st1, .st2 {
        fill: none;
        stroke: #707071;
        stroke-miterlimit: 10;
      }

      .st1 {
        stroke-width: 8.34px;
      }

      .st2 {
        stroke-width: 2.47px;
      }
      `;

      default:
        return ``;
    }
  };

  // Handle SVG click
  const onSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      console.log("triggered svg click");
      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = SVG_WIDTH / rect.width;
      const scaleY = SVG_HEIGHT / rect.height;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      console.log(Math.round(x), Math.round(y));
      if (isAdminMode) {
        handleMapClick(x, y, SVG_WIDTH, SVG_HEIGHT);
      }
    },
    [isAdminMode, handleMapClick],
  );

  // Handle double click to create node in admin mode
  const onSvgDoubleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      console.log("triggered double click");

      if (!isAdminMode || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = SVG_WIDTH / rect.width;
      const scaleY = SVG_HEIGHT / rect.height;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      createNodeAtPosition(x, y);
    },
    [isAdminMode, createNodeAtPosition],
  );

  // Handle node click
  const onNodeClick = useCallback(
    (node: MapNode) => {
      if (isAdminMode) {
        selectNode(node);
      } else {
        // In navigation mode, set as start or end
        if (!startNode) {
          setStartNode(node);
        } else if (!endNode) {
          setEndNode(node);
        } else {
          // Reset and set as new start
          setStartNode(node);
          setEndNode(null);
        }
      }
    },
    [isAdminMode, selectNode, startNode, endNode, setStartNode, setEndNode],
  );

  // Handle building click
  const onBuildingClick = useCallback(
    (building: Building) => {
      // Find the entrance of this building
      const entrance = nodes.find(
        (n) => n.buildingId === building.id && n.type === "ENTRANCE",
      );
      if (entrance && !isAdminMode) {
        if (!startNode) {
          setStartNode(entrance);
        } else if (!endNode) {
          setEndNode(entrance);
        }
      }
    },
    [nodes, isAdminMode, startNode, endNode, setStartNode, setEndNode],
  );

  return (
    <div className="relative w-full h-full bg-map-background rounded-lg overflow-hidden">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={3}
        onTransformed={(_, state) => {
          setZoomLevel(state.scale);
        }}
        wheel={{ step: 0.1 }}
        pinch={{ step: 5 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Zoom controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => zoomIn()}
                className="bg-card/90 backdrop-blur-sm shadow-md"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => zoomOut()}
                className="bg-card/90 backdrop-blur-sm shadow-md"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => resetTransform()}
                className="bg-card/90 backdrop-blur-sm shadow-md"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Zoom level indicator */}
            <div className="absolute bottom-4 right-4 z-10 bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground shadow-md">
              {Math.round(zoomLevel * 100)}%
            </div>

            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: "100%", height: "100%" }}
            >
              <svg
                id="Layer_1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 650"
                onClick={onSvgClick}
                onDoubleClick={onSvgDoubleClick}
                ref={svgRef}
              >
                <defs>
                  <style>{getFloorStyle(currentFloor)}</style>
                </defs>

                {currentFloor === 0 ? (
                  <>
                    <path
                      className="st1"
                      d="M148.71 498.02 L148.71 389.54 L105.93 389.54 L105.93 151.98 L254.13 151.98 L254.13 277.26 L254.13 219.21 L337.38 219.21 L254.13 219.21 L254.13 151.98 L364.12 151.98 L477.15 151.98 L639.61 151.98 L639.61 255.11 L728.07 255.11 L639.61 255.11 L639.61 151.98 L858.34 151.98 L858.34 230.66 L755.23 230.66 L755.23 255.11 L755.23 230.66 L933.21 230.66 L858.34 230.66 L858.34 151.98 L1084.45 151.98 L1084.45 274.97 L966.05 274.97 L966.05 256.64 L794.53 256.64 L882.02 256.64 L882.02 281.83 L882.02 256.64 L966.05 256.64 L966.05 302.46 L838.48 302.46 L966.05 302.46 L966.05 274.97 L1084.45 274.97 L1084.45 389.54 L1084.45 498.02 L1084.45 389.54 L965.28 389.54 L965.28 324.93 L840.77 324.93 L965.28 324.93 L965.28 389.54 L841.53 389.54 L841.53 349.06 L841.53 498.02"
                    />

                    <path
                      className="st1"
                      d="M750.06 498.02 L750.06 387.64 L464.76 387.64 L515.67 387.64 L515.67 498.02 L515.67 322.71 L515.67 387.64 L750.06 387.64 L750.06 325 L543.82 325 L540.77 325"
                    />

                    <path className="st1" d="M475.07 315.45 L367.37 315.45" />

                    <path
                      className="st1"
                      d="M380.73 388.4 L329.93 388.4 L329.93 349.82 L272.64 349.82 L329.93 349.82 L329.93 388.4 L254.31 388.4 L254.31 299.79 L254.31 496.1 L329.56 496.1 L329.56 410.36"
                    />

                    <path className="st2" d="M1089.26 498.02 L511.59 498.02" />

                    <path className="st4" d="M842.1 389.54 L750.06 389.54" />
                    <path className="st4" d="M842.1 401.7 L750.06 401.7" />
                    <path className="st4" d="M842.1 413.85 L750.06 413.85" />
                    <path className="st4" d="M842.1 426.01 L750.06 426.01" />
                    <path className="st4" d="M842.1 438.17 L750.06 438.17" />
                    <path className="st4" d="M842.1 450.32 L750.06 450.32" />
                    <path className="st4" d="M842.1 462.48 L750.06 462.48" />
                    <path className="st4" d="M842.1 474.63 L750.06 474.63" />

                    <path className="st0" d="M796.08 498.02 L796.08 389.55" />

                    <path className="st3" d="M254.31 389.54 L149.62 389.54" />
                    <path className="st3" d="M254.31 401.7 L149.62 401.7" />
                    <path className="st3" d="M254.31 413.85 L149.62 413.85" />
                    <path className="st3" d="M254.31 426.01 L149.62 426.01" />
                    <path className="st3" d="M254.31 438.17 L149.62 438.17" />
                    <path className="st3" d="M254.31 450.32 L149.62 450.32" />
                    <path className="st3" d="M254.31 462.48 L149.62 462.48" />
                    <path className="st3" d="M254.31 474.63 L149.62 474.63" />

                    <path className="st6" d="M201.96 498.02 L201.96 389.55" />

                    <path className="st1" d="M145.15 496.1 L250.33 496.1" />

                    <path className="st5" d="M374.19 256.24 L477.15 256.24" />
                    <path className="st5" d="M374.19 244.55 L477.15 244.55" />
                    <path className="st5" d="M374.19 232.87 L477.15 232.87" />
                    <path className="st5" d="M374.19 221.19 L477.15 221.19" />
                    <path className="st5" d="M374.19 209.5 L477.15 209.5" />
                    <path className="st5" d="M374.19 197.82 L477.15 197.82" />
                    <path className="st5" d="M374.19 186.13 L477.15 186.13" />
                    <path className="st5" d="M374.19 174.45 L477.15 174.45" />

                    <path className="st5" d="M425.67 256.24 L425.67 151.98" />

                    <path className="st1" d="M374.19 257.02 L374.19 151.98" />
                    <path
                      className="st1"
                      d="M603.96 255.06 L477.15 255.06 L477.15 150.02"
                    />
                  </>
                ) : currentFloor === 1 ? (
                  <>
                    <path className="st1" d="M400.33 224.79 H503.29" />
                    <path className="st1" d="M400.33 210.96 H503.29" />
                    <path className="st1" d="M400.33 197.13 H503.29" />
                    <path className="st1" d="M400.33 183.3 H503.29" />
                    <path className="st1" d="M400.33 169.47 H503.29" />
                    <path className="st1" d="M400.33 155.64 H503.29" />
                    <path className="st1" d="M400.33 141.81 H503.29" />
                    <path className="st1" d="M400.33 127.98 H503.29" />
                    <path className="st1" d="M451.81 224.79 V101.38" />

                    <path className="st3" d="M848.52 476.1 H715.68" />
                    <path className="st3" d="M848.52 486.92 H715.68" />
                    <path className="st3" d="M848.52 497.74 H715.68" />
                    <path className="st3" d="M848.52 508.56 H715.68" />
                    <path className="st3" d="M848.52 519.38 H715.68" />
                    <path className="st3" d="M848.52 530.2 H715.68" />
                    <path className="st3" d="M782.1 476.1 V545.07" />

                    <path className="st2" d="M284.01 462.65 H211.94" />
                    <path className="st2" d="M284.01 472.28 H211.94" />
                    <path className="st2" d="M284.01 481.92 H211.94" />
                    <path className="st2" d="M284.01 491.55 H211.94" />
                    <path className="st2" d="M284.01 501.19 H211.94" />
                    <path className="st2" d="M284.01 510.83 H211.94" />
                    <path className="st2" d="M284.01 520.46 H211.94" />
                    <path className="st2" d="M284.01 530.1 H211.94" />
                    <path className="st2" d="M247.97 462.64 V548.3" />
                    <path className="st0" d="M1088.12 458.24 V548.62" />

                    <path className="st0" d="M966.24 180.2 V419.7" />
                    <path className="st0" d="M894.04 333.11 H966.24" />
                    <path className="st0" d="M894.04 270.68 H966.24" />
                    <path className="st0" d="M966.24 302.17 H1088.13" />
                    <path className="st0" d="M1088.13 156.86 H962.85" />

                    <path className="st0" d="M966.24 101.38 V136.96" />
                    <path className="st0" d="M847.17 229.01 V101.38" />
                    <path className="st0" d="M712.1 225.69 V101.38" />
                    <path className="st0" d="M628.02 225.69 H821.93" />
                    <path className="st0" d="M603.03 228.93 V101.38" />
                    <path className="st0" d="M503.29 225.69 V101.38" />
                    <path className="st0" d="M400.33 225.69 V101.38" />
                    <path className="st0" d="M332.34 225.69 V101.38" />

                    <path className="st0" d="M264.36 101.38 V225.69 H137.06" />
                    <path className="st0" d="M290.09 225.69 H374.59" />

                    <path
                      className="st0"
                      d="
    M848.52 548.62
    H111.87
    V101.38
    H1088.13
    V548.62
    H848.52
    V396.93
    V458.24
    H1088.12
  "
                    />

                    <path className="st0" d="M399.65 457.84 H111.87" />
                    <path className="st0" d="M212.07 355.66 H111.87" />
                    <path className="st0" d="M209.1 457.84 V380.75" />
                    <path className="st0" d="M179.25 424.99 H209.1" />
                    <path className="st0" d="M165.08 457.84 V421.15" />
                    <path className="st0" d="M286.95 457.84 V374.9" />
                    <path className="st0" d="M374.4 352.23 H283.93" />
                    <path className="st0" d="M340.64 457.84 V352.23" />
                    <path className="st0" d="M399.65 548.3 V351.37" />
                    <path className="st0" d="M283.81 548.3 V457.84" />
                    <path className="st0" d="M211.75 548.3 V457.84" />

                    <path className="st0" d="M424.41 416.67 H504.72" />
                    <path className="st0" d="M503.37 416.67 H588.94" />

                    <path
                      className="st0"
                      d="M504.72 548.3 V368.5 H559.88 V416.67"
                    />
                    <path className="st0" d="M504.72 457.84 H821.81" />
                    <path className="st0" d="M602.84 458.4 V352.29" />
                    <path className="st0" d="M627.58 355.32 H715.68 V457.84" />
                    <path className="st0" d="M715.68 457.84 V548.3" />
                  </>
                ) : (
                  <>
                    <path className="st2" d="M400.96 229.02 H505.64" />
                    <path className="st2" d="M400.96 214.75 H505.64" />
                    <path className="st2" d="M400.96 200.47 H505.64" />
                    <path className="st2" d="M400.96 186.2 H505.64" />
                    <path className="st2" d="M400.96 171.93 H505.64" />
                    <path className="st2" d="M400.96 157.65 H505.64" />
                    <path className="st2" d="M400.96 143.38 H505.64" />
                    <path className="st2" d="M400.96 129.11 H505.64" />
                    <path className="st2" d="M453.3 229.03 V101.65" />

                    <path className="st0" d="M850.13 471.6 H718.25" />
                    <path className="st0" d="M850.13 483.56 H718.25" />
                    <path className="st0" d="M850.13 495.51 H718.25" />
                    <path className="st0" d="M850.13 507.47 H718.25" />
                    <path className="st0" d="M850.13 519.42 H718.25" />
                    <path className="st0" d="M850.13 531.37 H718.25" />
                    <path className="st0" d="M784.19 471.6 V547.8" />

                    <path className="st0" d="M288.38 468.28 H209.29" />
                    <path className="st0" d="M288.38 477.23 H209.29" />
                    <path className="st0" d="M288.38 486.17 H209.29" />
                    <path className="st0" d="M288.38 495.12 H209.29" />
                    <path className="st0" d="M288.38 504.06 H209.29" />
                    <path className="st0" d="M288.38 513.01 H209.29" />
                    <path className="st0" d="M288.38 521.95 H209.29" />
                    <path className="st0" d="M288.38 530.9 H209.29" />
                    <path className="st0" d="M248.84 468.28 V547.8" />

                    <path className="st1" d="M391.05 548.12 H520.87" />
                    <path className="st1" d="M604.62 456.76 H824.84" />
                    <path className="st1" d="M604.62 548.35 V350.83" />

                    <path
                      className="st1"
                      d="M718.25 547.8 V456.76 V353.97 H629.77"
                    />

                    <path className="st1" d="M111.87 457.11 H589.76" />
                    <path className="st1" d="M400.72 547.8 V350.81" />

                    <path className="st1" d="M375.45 353.97 H288.38 V547.8" />

                    <path className="st1" d="M111.87 353.97 H212.48" />
                    <path className="st1" d="M209.29 547.8 V401.99" />

                    <path className="st1" d="M375.45 226.68 H136.93" />
                    <path className="st1" d="M264.96 101.65 V226.68" />

                    <path className="st1" d="M400.96 230.55 V101.65" />
                    <path className="st1" d="M505.64 230.55 V101.65" />
                    <path className="st1" d="M604.62 230.55 V101.65" />
                    <path className="st1" d="M714.73 226.68 V101.65" />

                    <path className="st1" d="M629.77 226.68 H824.84" />
                    <path className="st1" d="M850.13 229.97 V101.65" />

                    <path className="st1" d="M966.25 147.98 V101.65" />
                    <path className="st1" d="M962.06 168.58 H1088.13" />

                    <path className="st1" d="M965.93 314.18 H1088.13" />
                    <path className="st1" d="M965.93 432.74 V191.51" />

                    <path
                      className="st1"
                      d="M965.93 345.77 H897.34 V282.35 H965.93"
                    />

                    <path className="st1" d="M850.13 456.76 H1088.13" />
                    <path className="st1" d="M850.13 548.12 V395.09" />

                    <path
                      className="st1"
                      d="
    M718.25 547.8
    H111.87
    V101.65
    H1088.13
    V548.12
    H718.25
  "
                    />
                  </>
                )}

                {/* Connections (admin mode shows them prominently) */}
                <ConnectionLayer
                  nodes={nodesOnCurrentFloor}
                  isAdminMode={isAdminMode}
                  selectedNodeId={selectedNode?.id}
                />

                {/* Path overlay */}
                {currentPath && <PathOverlay path={currentPath} />}

                {/* Nodes */}
                <NodeLayer
                  nodes={nodesOnCurrentFloor}
                  selectedNodeId={selectedNode?.id}
                  startNodeId={startNode?.id}
                  endNodeId={endNode?.id}
                  isAdminMode={isAdminMode}
                  isConnecting={isConnecting}
                  connectionStartId={connectionStart?.id}
                  onNodeClick={onNodeClick}
                  onNodeHover={setHoveredNode}
                  zoomLevel={zoomLevel}
                />
              </svg>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      {/* Hovered node tooltip */}
      {hoveredNode && !isAdminMode && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 map-panel px-4 py-2 animate-fade-in">
          <p className="text-sm font-medium">{hoveredNode.name}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {hoveredNode.type.toLowerCase()}
          </p>
        </div>
      )}
    </div>
  );
}
