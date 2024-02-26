import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import Homepage from "../pages/Homepage"
import Synchronisation from "../pages/Synchronisation"
import Commande from "../pages/Commande"

const Header = ({currentPage, onSwitchPage}) => {
  return (
    <div>
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="home">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="home">
          <Homepage />
        </TabsContent>
        <TabsContent value="synchro">
          <Synchronisation />
        </TabsContent>
        <TabsContent value="commande">
          <Commande />
        </TabsContent>
        <TabsContent value="commande">
          <Commande />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Header