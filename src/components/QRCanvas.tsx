import { forwardRef } from 'react';
import { View } from 'react-native';
import { Canvas, Rect, Image as SkiaImage } from '@shopify/react-native-skia';
import { isFinderPattern, isLogoArea } from '../utils/qrGenerator';

interface QRCanvasProps {
  qrData: Uint8Array | [];
  qrSize: number;
  qrSquareSize: number;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  skiaLogo: any;
  canvasSize: number;
  logoSize: number;
  padding: number;
}

export const QRCanvas = forwardRef<any, QRCanvasProps>((props, ref) => {
  return (
    <View className="items-center bg-white p-4 rounded-2xl shadow-sm">
      <Canvas
        ref={ref}
        style={{ width: props.canvasSize, height: props.canvasSize }}
      >
        <Rect
          x={0}
          y={0}
          width={props.canvasSize}
          height={props.canvasSize}
          color={props.backgroundColor}
        />
        {Array.from(props.qrData).map((value, index) => {
          const colIndex = index % props.qrSize;
          const rowIndex = Math.floor(index / props.qrSize);
          if (props.skiaLogo && isLogoArea(rowIndex, colIndex, props.qrSize)) {
            return null;
          }
          if (value) {
            return (
              <Rect
                key={index}
                x={colIndex * props.qrSquareSize + props.padding}
                y={rowIndex * props.qrSquareSize + props.padding}
                width={props.qrSquareSize}
                height={props.qrSquareSize}
                color={
                  isFinderPattern(rowIndex, colIndex, props.qrSize)
                    ? props.secondaryColor
                    : props.primaryColor
                }
              />
            );
          }
        })}
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
