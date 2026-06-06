"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("ErrorBoundary caught:", error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			return (
				this.props.fallback || (
					<div className="flex flex-col items-center justify-center p-8 text-(--color-muted-foreground) font-mono text-[10px] uppercase tracking-widest">
						<span className="text-(--color-delta-negative) text-sm mb-1">⚠</span>
						something went wrong
						<button
							type="button"
							onClick={() => this.setState({ hasError: false })}
							className="mt-3 font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-md border border-(--color-border) hover:text-(--color-foreground) hover:border-(--color-muted) transition-all cursor-pointer"
						>
							try again
						</button>
					</div>
				)
			);
		}
		return this.props.children;
	}
}
