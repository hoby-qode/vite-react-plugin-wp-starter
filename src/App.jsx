import React, { useState, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import clsx from "clsx";
import { HomeIcon } from "lucide-react";

const Synchronisation = React.lazy(() => import("./pages/Synchronisation"));
const Commande = React.lazy(() => import("./pages/Commande"));
const Homepage = React.lazy(() => import('./pages/Homepage'));
const Inventaire = React.lazy(() => import('./pages/Inventaire'));

function App() {
  return (
    <section className={clsx("p-4")}>
      <Tabs  defaultValue="home">
        <TabsList>
          <TabsTrigger value="home"><HomeIcon width={15} /></TabsTrigger>
          <TabsTrigger value="synchro">Synchronisation</TabsTrigger>
          <TabsTrigger value="commande">Commande</TabsTrigger>
          <TabsTrigger value="inventaire">Inventaire</TabsTrigger>
        </TabsList>
        <Suspense fallback={<div>Loading...</div>}>
          <TabsContent value="home">
            <Homepage />
          </TabsContent>
          <TabsContent value="synchro">
            <Synchronisation />
          </TabsContent>
          <TabsContent value="commande">
            <Commande />
          </TabsContent>
          <TabsContent value="inventaire">
            <Inventaire />
          </TabsContent>
        </Suspense>
      </Tabs>
    </section>
  )
}

export default App
