import React, { createContext, useContext, useState } from 'react'; // Import necessary React hooks

const ImageContext = createContext(); // Create a context for image upload
const setImageContext = createContext(); // Create a context for setting image URL
const PreviewContext = createContext(); // Create a context for preview URL
const setPreviewContext = createContext(); // Create a context for setting preview URL
const FileInputContext = createContext(); // Create a context for file input
const setFileInputContext = createContext(); // Create a context for setting file input

export const useUploadedImage = () => {
    const context = useContext(ImageContext); // Use the context
    if (!context) {
        throw new Error("useImageUpload must be used within an ImageUploadProvider"); // Error handling
    }
    return context; // Return the context value
}

export const useSetUploadedImage = () => {
    const context = useContext(setImageContext); // Use the context
    if (!context) {
        throw new Error("useSetImageUpload must be used within an ImageUploadProvider"); // Error handling
    }
    return context; // Return the context value
}

export const usePreviewImage = () => {
    const context = useContext(PreviewContext); // Use the context
    if (!context) {
        throw new Error("usePreviewImage must be used within an ImageUploadProvider"); // Error handling
    }
    return context; // Return the context value
}

export const useSetPreviewImage = () => {
    const context = useContext(setPreviewContext); // Use the context
    if (!context) {
        throw new Error("useSetPreviewImage must be used within an ImageUploadProvider"); // Error handling
    }
    return context; // Return the context value
}

export const useFileInput = () => {
    const context = useContext(FileInputContext); // Use the context
    if (!context) {
        throw new Error("useFileInput must be used within an ImageUploadProvider"); // Error handling
    }
    return context; // Return the context value
}

export const useSetFileInput = () => {
    const context = useContext(setFileInputContext); // Use the context
    if (!context) {
        throw new Error("useSetFileInput must be used within an ImageUploadProvider"); // Error handling
    }
    return context; // Return the context value
}

// This component holds the current uploaded image URL and the function to set it 
export default function UploadedImageProvider({ children }) {
    const [imageUrl, setImageUrl] = useState(null); // State to hold the uploaded image URL
    const [previewUrl, setPreviewUrl] = useState(null); // State to hold the preview URL
    const [fileInput, setFileInput] = useState(null); // State to hold the file input element

    const getImageUrl = () => {
        return imageUrl; // Function to get the image URL
    }

    const getPreviewUrl = () => {
        return previewUrl; // Function to get the preview URL
    }

    const getFileInput = () => {
        return fileInput; // Function to get the file input element
    }

    return (
        <ImageContext.Provider value={getImageUrl}>
            <setImageContext.Provider value={setImageUrl}>
                <PreviewContext.Provider value={getPreviewUrl}>
                    <setPreviewContext.Provider value={setPreviewUrl}>
                        <FileInputContext.Provider value={getFileInput}>
                            <setFileInputContext.Provider value={setFileInput}>
                                {children}
                            </setFileInputContext.Provider>
                        </FileInputContext.Provider>
                    </setPreviewContext.Provider>
                </PreviewContext.Provider>
            </setImageContext.Provider>
        </ImageContext.Provider>
    );
}