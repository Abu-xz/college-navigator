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
        .st0 { stroke-width: 1.61px; }
        .st0, .st1, .st2, .st3, .st4, .st5, .st6, .st7 {
          fill: none;
          stroke: #111111;
          stroke-miterlimit: 4;
        }
        .st1 { stroke-width: 1.23px; }
        .st2 { stroke-width: 0.31px; }
        .st3 { stroke-width: 8.34px; }
        .st4 { stroke-width: 8.38px; }
        .st5 { stroke-width: 1.48px; }
        .st6 { stroke-width: 1.43px; }
        .st7 { stroke-width: 1.39px; }
      `;

      case 1:
        return `
        .st0 { stroke-width: 1.8px; }
      .st0, .st1, .st2, .st3 {
        fill: none;
        stroke: #707071;
        stroke-miterlimit: 10;
      }
      .st1 { stroke-width: 8.34px; }
      .st2 { stroke-width: 1.84px; }
      .st3 { stroke-width: 1.9px; }
      `;
      case 2:
        return `
          .st0 { stroke-width: 11.52px; }
        .st0, .st1, .st2 {
          fill: none;
          stroke: #707071;
          stroke-miterlimit: 10;
        }
        .st1 { stroke-width: 2.47px; }
        .st2 { stroke-width: 2.48px; }
       
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
                    <polyline
                      className="st3"
                      points="1046.48 151.98 1046.48 260.46 1089.26 260.46 1089.26 498.02 941.06 498.02 941.06 372.74 941.06 430.79 857.81 430.79 941.06 430.79 941.06 498.02 831.07 498.02 706.56 498.02 706.56 397.19 576.71 397.19 706.56 397.19 706.56 498.02 555.58 498.02 555.58 394.89 467.12 394.89 555.58 394.89 555.58 498.02 336.85 498.02 336.85 419.34 439.96 419.34 439.96 394.89 439.96 419.34 261.98 419.34 336.85 419.34 336.85 498.02 110.74 498.02 110.74 375.03 229.14 375.03 229.14 393.36 400.66 393.36 313.17 393.36 313.17 368.17 313.17 393.36 229.14 393.36 229.14 347.54 356.71 347.54 229.14 347.54 229.14 375.03 110.74 375.03 110.74 260.46 110.74 151.98 110.74 260.46 229.91 260.46 229.91 325.07 354.42 325.07 229.91 325.07 229.91 260.46 353.66 260.46 353.66 300.94 353.66 151.98"
                    />

                    <path className="st3" d="M834.67 393.11 L834.67 495.1" />

                    <polyline
                      className="st3"
                      points="445.7 151.98 445.7 262.36 731 262.36 680.09 262.36 680.09 151.98 680.09 327.29 680.09 262.36 445.7 262.36 445.7 325 651.94 325 654.99 325"
                    />

                    <path className="st3" d="M720.69 334.55 L828.39 334.55" />

                    <polyline
                      className="st3"
                      points="815.03 261.6 865.83 261.6 865.83 300.18 923.12 300.18 865.83 300.18 865.83 261.6 941.45 261.6 941.45 350.21 941.45 153.9 866.2 153.9 866.2 239.64"
                    />

                    <path className="st4" d="M106.5 151.98 L684.17 151.98" />

                    <path
                      className="st1"
                      d="
    M353.66 260.46 L445.7 260.46
    M353.66 248.3  L445.7 248.3
    M353.66 236.15 L445.7 236.15
    M353.66 223.99 L445.7 223.99
    M353.66 211.83 L445.7 211.83
    M353.66 199.68 L445.7 199.68
    M353.66 187.52 L445.7 187.52
    M353.66 175.37 L445.7 175.37"
                    />

                    <path className="st7" d="M399.68 151.98 L399.68 260.45" />

                    <path
                      className="st2"
                      d="
    M941.45 260.46 L1046.14 260.46
    M941.45 248.3  L1046.14 248.3
    M941.45 236.15 L1046.14 236.15
    M941.45 223.99 L1046.14 223.99
    M941.45 211.83 L1046.14 211.83
    M941.45 199.68 L1046.14 199.68
    M941.45 187.52 L1046.14 187.52
    M941.45 175.37 L1046.14 175.37"
                    />

                    <path className="st5" d="M993.8 151.98 L993.8 260.45" />

                    <path
                      className="st6"
                      d="
    M834.67 394.17 L705.51 394.17
    M834.67 405.81 L705.51 405.81
    M834.67 417.45 L705.51 417.45
    M834.67 429.08 L705.51 429.08
    M834.67 440.72 L705.51 440.72
    M834.67 452.36 L705.51 452.36
    M834.67 463.99 L705.51 463.99
    M834.67 475.63 L705.51 475.63"
                    />

                    <path className="st0" d="M770.09 498.02 L770.09 394.17" />

                    <path className="st3" d="M1050.61 153.9 L945.43 153.9" />
                  </>
                ) : currentFloor === 1 ? (
                  <>
                    <path
                      className="st3"
                      d="
    M696.71 224.79 L799.67 224.79
    M696.71 210.96 L799.67 210.96
    M696.71 197.13 L799.67 197.13
    M696.71 183.3  L799.67 183.3
    M696.71 169.47 L799.67 169.47
    M696.71 155.64 L799.67 155.64
    M696.71 141.81 L799.67 141.81
    M696.71 127.98 L799.67 127.98"
                    />
                    <path className="st3" d="M748.19 101.38 L748.19 224.79" />

                    <path
                      className="st0"
                      d="
    M484.32 476.1 L351.48 476.1
    M484.32 486.92 L351.48 486.92
    M484.32 497.74 L351.48 497.74
    M484.32 508.56 L351.48 508.56
    M484.32 519.38 L351.48 519.38
    M484.32 530.2  L351.48 530.2"
                    />
                    <path className="st0" d="M417.9 545.07 L417.9 476.1" />

                    <path
                      className="st2"
                      d="
    M988.06 462.65 L915.99 462.65
    M988.06 472.28 L915.99 472.28
    M988.06 481.92 L915.99 481.92
    M988.06 491.55 L915.99 491.55
    M988.06 501.19 L915.99 501.19
    M988.06 510.83 L915.99 510.83
    M988.06 520.46 L915.99 520.46
    M988.06 530.1  L915.99 530.1"
                    />
                    <path className="st2" d="M952.03 548.3 L952.03 462.65" />

                    <path className="st1" d="M111.88 548.62 L111.88 458.24" />

                    <path
                      className="st1"
                      d="
    M233.76 419.7 L233.76 180.2
    M233.76 333.11 L305.96 333.11
    M233.76 270.68 L305.96 270.68
    M111.87 302.17 L233.76 302.17
    M237.15 156.86 L111.87 156.86"
                    />

                    <path className="st1" d="M233.76 136.96 L233.76 101.38" />
                    <path className="st1" d="M352.83 101.38 L352.83 229.01" />
                    <path className="st1" d="M487.9 101.38 L487.9 225.69" />
                    <path className="st1" d="M378.07 225.69 L571.98 225.69" />
                    <path className="st1" d="M596.97 101.38 L596.97 228.93" />
                    <path className="st1" d="M696.71 101.38 L696.71 225.69" />
                    <path className="st1" d="M799.67 101.38 L799.67 225.69" />
                    <path className="st1" d="M867.66 101.38 L867.66 225.69" />

                    <polyline
                      className="st1"
                      points="1062.94 225.69 935.64 225.69 935.64 101.38"
                    />
                    <path className="st1" d="M825.41 225.69 L909.91 225.69" />

                    <polyline
                      className="st1"
                      points="111.88 458.24 351.48 458.24 351.48 396.93 351.48 548.62 111.88 548.62 111.87 548.62 111.87 101.38 1088.13 101.38 1088.13 548.3 351.48 548.62"
                    />

                    <path className="st1" d="M1088.13 457.84 L800.35 457.84" />
                    <path className="st1" d="M1088.13 355.66 L987.93 355.66" />
                    <path className="st1" d="M990.9 380.75 L990.9 457.84" />
                    <path className="st1" d="M990.9 424.99 L1020.75 424.99" />
                    <path className="st1" d="M1034.92 421.15 L1034.92 457.84" />
                    <path className="st1" d="M913.05 374.9 L913.05 457.84" />
                    <path className="st1" d="M916.07 352.23 L825.6 352.23" />
                    <path className="st1" d="M859.36 352.23 L859.36 457.84" />
                    <path className="st1" d="M800.35 351.37 L800.35 548.3" />
                    <path className="st1" d="M916.19 457.84 L916.19 548.3" />
                    <path className="st1" d="M988.25 457.84 L988.25 548.3" />
                    <path className="st1" d="M695.28 416.67 L775.59 416.67" />
                    <path className="st1" d="M611.06 416.67 L696.63 416.67" />

                    <polyline
                      className="st1"
                      points="640.12 416.67 640.12 368.5 640.32 368.5 695.28 368.5 695.28 548.3"
                    />

                    <path className="st1" d="M378.19 457.84 L695.28 457.84" />
                    <path className="st1" d="M597.16 352.29 L597.16 458.4" />

                    <polyline
                      className="st1"
                      points="484.32 457.84 484.32 355.32 572.42 355.32"
                    />

                    <path className="st1" d="M484.32 548.3 L484.32 457.84" />
                  </>
                ) : (
                  <>
                    <path
                      className="st1"
                      d="
    M694.36 229.02 L799.04 229.02
    M694.36 214.75 L799.04 214.75
    M694.36 200.47 L799.04 200.47
    M694.36 186.2  L799.04 186.2
    M694.36 171.93 L799.04 171.93
    M694.36 157.65 L799.04 157.65
    M694.36 143.38 L799.04 143.38
    M694.36 129.11 L799.04 129.11"
                    />
                    <path className="st1" d="M746.7 101.65 L746.7 229.03" />

                    <path
                      className="st2"
                      d="
    M481.75 471.6 L349.87 471.6
    M481.75 483.56 L349.87 483.56
    M481.75 495.51 L349.87 495.51
    M481.75 507.47 L349.87 507.47
    M481.75 519.42 L349.87 519.42
    M481.75 531.37 L349.87 531.37"
                    />
                    <path className="st2" d="M415.81 547.8 L415.81 471.6" />

                    <path
                      className="st2"
                      d="
    M990.71 468.28 L911.62 468.28
    M990.71 477.23 L911.62 477.23
    M990.71 486.17 L911.62 486.17
    M990.71 495.12 L911.62 495.12
    M990.71 504.06 L911.62 504.06
    M990.71 513.01 L911.62 513.01
    M990.71 521.95 L911.62 521.95
    M990.71 530.9  L911.62 530.9"
                    />
                    <path className="st2" d="M951.16 547.8 L951.16 468.28" />

                    <path className="st0" d="M679.13 548.12 L808.95 548.12" />
                    <path className="st0" d="M375.16 456.76 L595.38 456.76" />
                    <path className="st0" d="M595.38 350.83 L595.38 548.35" />
                    <polyline
                      className="st0"
                      points="570.23 353.97 481.75 353.97 481.75 456.76 481.75 547.8"
                    />
                    <path className="st0" d="M610.24 457.11 L1088.13 457.11" />
                    <path className="st0" d="M799.28 350.81 L799.28 547.8" />
                    <polyline
                      className="st0"
                      points="911.62 547.8 911.62 353.97 824.55 353.97"
                    />
                    <path className="st0" d="M987.52 353.97 L1088.13 353.97" />
                    <path className="st0" d="M990.71 401.99 L990.71 547.8" />
                    <path className="st0" d="M1063.07 226.68 L824.55 226.68" />
                    <path className="st0" d="M935.04 226.68 L935.04 101.65" />
                    <path className="st0" d="M799.04 101.65 L799.04 230.55" />
                    <path className="st0" d="M694.36 101.65 L694.36 230.55" />
                    <path className="st0" d="M595.38 101.65 L595.38 230.55" />
                    <path className="st0" d="M485.27 101.65 L485.27 226.68" />
                    <path className="st0" d="M375.16 226.68 L570.23 226.68" />
                    <path className="st0" d="M349.87 101.65 L349.87 229.97" />
                    <path className="st0" d="M233.75 101.65 L233.75 147.98" />
                    <path className="st0" d="M111.87 168.58 L237.94 168.58" />
                    <path className="st0" d="M111.87 314.18 L234.07 314.18" />
                    <path className="st0" d="M234.07 191.51 L234.07 432.74" />
                    <polyline
                      className="st0"
                      points="234.07 282.35 302.66 282.35 302.66 345.77 234.07 345.77"
                    />
                    <path className="st0" d="M111.87 456.76 L349.87 456.76" />
                    <path className="st0" d="M349.87 395.09 L349.87 548.12" />
                    <polyline
                      className="st0"
                      points="481.75 548.12 111.87 548.12 111.87 101.65 1088.13 101.65 1088.13 547.8 481.75 547.8"
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
