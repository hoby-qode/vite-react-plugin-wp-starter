import { Button } from "@/src/components/ui/button"
import DashboardPage from "../components/dashboard/page"
const Homepage = () => {
  return (
    <div className="m-4">
        <h1>Homepage</h1>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil error ipsa nulla similique blanditiis accusantium cumque odio perferendis possimus doloremque libero dolorem dolor est at, vero necessitatibus sed expedita optio.
        
        <Button asChild>
          <a href="/login">Login</a>
        </Button>

        <DashboardPage />
    </div>
  )
}
export default Homepage