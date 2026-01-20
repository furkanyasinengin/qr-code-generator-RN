# QR Generator

QR Generator is a high-performance, fully customizable QR code generator built with React Native. It leverages the Skia graphics engine to render crisp, scalable QR codes with advanced styling capabilities.

Unlike standard generators, QR Generator allows for real-time customization, logo integration with smart quiet-zone calculation, and native sharing options, ensuring a seamless user experience on Android devices.

## Key Features

- **High-Performance Rendering:** Uses `@shopify/react-native-skia` for smooth and efficient vector graphics drawing.
- **Deep Customization:** Users can individually change the colors of the QR Data, Finder Patterns (Eye), and Background.
- **Smart Logo Integration:**
  - Import images from the device gallery.
  - Automatically centers the logo within the QR code.
  - **Quiet Zone Clearing:** Intelligently removes the QR data modules behind the logo to ensure the code remains scannable.
- **Native Saving & Sharing:**
  - Share the generated QR code directly to social media apps (WhatsApp, Instagram, etc.).
  - Save the high-quality image directly to the device gallery.
- **Optimized User Experience:** Custom keyboard handling for seamless input on Android devices.

## Screenshots

|                     Default View                      |                    Custom Styling                    |
| :---------------------------------------------------: | :--------------------------------------------------: |
| <img src="./assets/screen_default.png" width="300" /> | <img src="./assets/screen_custom.png" width="300" /> |
|            **Standard startup interface.**            |       **Custom colors and logo integration.**        |

|                  Save Confirmation                  |                    Gallery Result                     |
| :-------------------------------------------------: | :---------------------------------------------------: |
| <img src="./assets/screen_saved.png" width="300" /> | <img src="./assets/result_gallery.png" width="300" /> |
|        **In-app notification upon saving.**         |          **Final output in device gallery.**          |

## Technology Stack

- **Core:** React Native
- **Graphics Engine:** React Native Skia
- **Logic:** qrcode-generator
- **File System:** React Native FS / CameraRoll
- **Integration:** React Native Image Picker / Share
