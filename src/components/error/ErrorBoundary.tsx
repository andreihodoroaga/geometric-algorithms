import React, { Component, ErrorInfo } from "react";
import Snackbar from "@mui/material/Snackbar";
import { Button } from "@mui/material";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      hasError: true,
      error,
      errorInfo,
    });
  }

  handleCloseErrorSnackbar = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ position: "relative" }}>
          {this.props.children}

          <Snackbar
            className="error-snackbar"
            style={{ position: "absolute", bottom: 16 }}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            open={this.state.hasError}
            onClose={this.handleCloseErrorSnackbar}
            message={this.state.error?.message || "An error occurred"}
            action={
              <Button color="inherit" onClick={this.handleCloseErrorSnackbar}>
                X
              </Button>
            }
            ClickAwayListenerProps={{ onClickAway: this.handleCloseErrorSnackbar }}
            transitionDuration={200}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
