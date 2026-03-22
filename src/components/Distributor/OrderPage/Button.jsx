import React from "react";

const Button = ({ onClick, children }) => {
    const [isLoading, setIsLoading] = React.useState(false);
  
    const handleClick = async () => {
      setIsLoading(true);
      await onClick();
      setIsLoading(false);
    };
  
    return (
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Loading...' : "Accept"}
      </button>
    );
  };
  
  export default Button;