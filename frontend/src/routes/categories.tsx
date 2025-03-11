import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/categories")({
    component: Categories
});


function Categories() {
    return (
        <div>
            <h1>Categories</h1>
        </div>
    )
}