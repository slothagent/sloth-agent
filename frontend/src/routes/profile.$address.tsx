import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/$address")({
    component: Profile
});


function Profile() {
    const { address } = Route.useParams();
    return (
        <div>
            <h1>Profile</h1>
        </div>
    )
}