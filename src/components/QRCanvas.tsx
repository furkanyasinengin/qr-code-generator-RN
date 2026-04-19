import { forwardRef } from 'react';
import { View } from 'react-native';
import {
  Path,
  Canvas,
  Rect,
  RoundedRect,
  Circle,
  Image as SkiaImage,
  Group,
  LinearGradient,
  vec,
} from '@shopify/react-native-skia';
import { isFinderPattern, isLogoArea } from '../utils/qrGenerator';
import React from 'react';

interface QRCanvasProps {
  qrData: Uint8Array | [];
  qrSize: number;
  qrSquareSize: number;
  // primaryColor: string;
  // secondaryColor: string;
  // backgroundColor: string;
  design: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    isGradient: boolean;
    gradientColor: string;
    gradientDirection: string;
    dotShape: string;
    eyeShape: string;
  };
  skiaLogo: any;
  canvasSize: number;
  logoSize: number;
  padding: number;
}

export const QRCanvas = forwardRef<any, QRCanvasProps>((props, ref) => {
  const { qrData, qrSize, qrSquareSize, design, padding } = props;

  const renderModule = (
    x: number,
    y: number,
    color: string,
    isEye: boolean,
    key: number,
  ) => {
    const shapeToUse = isEye ? design.eyeShape : design.dotShape;
    const finalColor = design.isGradient ? undefined : color;

    if (isEye) {
      switch (shapeToUse) {
        case 'dots':
          return (
            <RoundedRect
              key={key}
              x={x}
              y={y}
              width={qrSquareSize}
              height={qrSquareSize}
              r={qrSquareSize * 0.5}
              color={finalColor}
            />
          );
        case 'diamond': {
          const half = qrSquareSize / 2;

          const path = `
    M ${x + half} ${y}
    L ${x + qrSquareSize} ${y + half}
    L ${x + half} ${y + qrSquareSize}
    L ${x} ${y + half}
    Z
  `;

          return <Path key={key} path={path} color={finalColor} />;
        }

        case 'rounded':
          return (
            <RoundedRect
              key={key}
              x={x}
              y={y}
              width={qrSquareSize}
              height={qrSquareSize}
              r={qrSquareSize * 0.3}
              color={finalColor}
            />
          );
        default:
          return (
            <Rect
              key={key}
              x={x}
              y={y}
              width={qrSquareSize}
              height={qrSquareSize}
              color={finalColor}
            />
          );
      }
    } else {
      switch (shapeToUse) {
        case 'rounded':
          return (
            <RoundedRect
              key={key}
              x={x}
              y={y}
              width={qrSquareSize}
              height={qrSquareSize}
              r={qrSquareSize * 0.35}
              color={finalColor}
            />
          );

        case 'dots': {
          const radius = qrSquareSize / 2;
          return (
            <Circle
              key={key}
              cx={x + radius}
              cy={y + radius}
              r={radius * 0.9}
              color={finalColor}
            />
          );
        }

        case 'vertical':
          return (
            <RoundedRect
              key={key}
              x={x + qrSquareSize * 0.25}
              y={y}
              width={qrSquareSize * 0.5}
              height={qrSquareSize}
              r={qrSquareSize * 0.25}
              color={finalColor}
            />
          );

        case 'horizontal':
          return (
            <RoundedRect
              key={key}
              x={x}
              y={y + qrSquareSize * 0.25}
              width={qrSquareSize}
              height={qrSquareSize * 0.5}
              r={qrSquareSize * 0.25}
              color={finalColor}
            />
          );

        case 'squircle': {
          const r = qrSquareSize * 0.5;

          const path = `
    M ${x + r} ${y}
    C ${x + qrSquareSize} ${y}, ${x + qrSquareSize} ${y}, ${x + qrSquareSize} ${y + r}
    C ${x + qrSquareSize} ${y + qrSquareSize}, ${x + qrSquareSize} ${y + qrSquareSize}, ${x + r} ${y + qrSquareSize}
    C ${x} ${y + qrSquareSize}, ${x} ${y + qrSquareSize}, ${x} ${y + r}
    C ${x} ${y}, ${x} ${y}, ${x + r} ${y}
    Z
  `;

          return <Path key={key} path={path} color={finalColor} />;
        }

        default:
          return (
            <Rect
              key={key}
              x={x}
              y={y}
              width={qrSquareSize}
              height={qrSquareSize}
              color={finalColor}
            />
          );
      }
    }
  };

  const getGradientPoints = () => {
    const size = props.canvasSize;
    switch (design.gradientDirection) {
      case 'vertical':
        return { start: vec(0, 0), end: vec(0, size) };
      case 'diagonal':
        return { start: vec(0, 0), end: vec(size, size) };
      case 'horizontal':
      default:
        return { start: vec(0, 0), end: vec(size, 0) };
    }
  };

  const gradientPoints = getGradientPoints();

  const normalModules: any[] = [];
  const eyeModules: any[] = [];

  Array.from(qrData).forEach((value, index) => {
    const colIndex = index % qrSize;
    const rowIndex = Math.floor(index / qrSize);

    if (props.skiaLogo && isLogoArea(rowIndex, colIndex, qrSize)) {
      return;
    }

    if (value) {
      const isEye = isFinderPattern(rowIndex, colIndex, qrSize);
      const color = isEye ? design.secondaryColor : design.primaryColor;

      const x = colIndex * qrSquareSize + padding;
      const y = rowIndex * qrSquareSize + padding;

      const element = renderModule(x, y, color, isEye, index);

      if (isEye && !design.isGradient) {
        eyeModules.push(element);
      } else {
        normalModules.push(element);
      }
    }
  });

  return (
    <View className="items-center bg-white p-4 rounded-2xl border border-gray-100">
      <Canvas
        ref={ref}
        style={{ width: props.canvasSize, height: props.canvasSize }}
      >
        <Rect
          x={0}
          y={0}
          width={props.canvasSize}
          height={props.canvasSize}
          color={design.backgroundColor}
        />
        <Group>
          {design.isGradient && (
            <LinearGradient
              start={gradientPoints.start}
              end={gradientPoints.end}
              colors={[design.primaryColor, design.gradientColor]}
            />
          )}
          {normalModules}
        </Group>
        {!design.isGradient && <Group>{eyeModules}</Group>}
        {props.skiaLogo && (
          <SkiaImage
            image={props.skiaLogo}
            x={(props.canvasSize - props.logoSize + props.padding / 2) / 2}
            y={(props.canvasSize - props.logoSize + props.padding / 2) / 2}
            width={props.logoSize}
            height={props.logoSize}
            fit="contain"
          />
        )}
      </Canvas>
    </View>
  );
});
