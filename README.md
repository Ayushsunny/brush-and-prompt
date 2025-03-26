# Brush & Prompt - AI Image Editing

Brush & Prompt is an AI-powered image editing tool that allows users to upload images, make selections using a brush tool, and transform selected areas using AI-powered prompts. This project is built using **Vite**, **React**, **TypeScript**, **ShadCN**, and **TailwindCSS**.

## Features
- **Image Uploading**: Users can upload images via drag-and-drop or file selection.
- **Brush Selection Tool**: Select an area of the image for AI transformation.
- **AI-Powered Image Transformation**: Uses AI to modify selected areas based on user prompts.
- **Undo/Redo Functionality**: Keeps track of history for easier editing.
- **Side-by-Side Comparison**: Allows users to compare the original and AI-generated image.
- **Download Feature**: Save the generated images locally.

## Tech Stack
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **TailwindCSS** & **ShadCN** for styling
- **Lucide-react** for icons
- **React Hook Form & Zod** for form validation
- **Axios** for API requests
- **Sonner** for toast notifications
- **Radix UI** components for accessible UI elements
- **Recharts** for data visualization

## Installation

Ensure you have **Node.js** installed. Then, clone the repository and install dependencies:

```sh
# Clone the repository
git clone https://github.com/Ayushsunny/brush-and-prompt
cd your-repo

# Install dependencies
npm install
```

## Running the Project

To start the development server:

```sh
npm run dev
```

To build the project:

```sh
npm run build
```

To preview the built project:

```sh
npm run preview
```

## How It Works

1. **Upload an Image**: Drag and drop an image or select one from your device.
2. **Select an Area**: Use the brush tool to highlight areas for transformation.
3. **Enter a Prompt**: Describe how you want the selected area to change.
4. **Generate & Download**: AI processes the image and produces a transformed version. Download the image to save it locally.

## Deployment
To deploy, you can use Vercel, Netlify, or any static site hosting:

```sh
npm run build
# Deploy the contents of the dist/ folder
```

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a Pull Request

## License
MIT License

