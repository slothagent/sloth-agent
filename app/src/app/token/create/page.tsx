import CreateToken from "@/components/pages/CreateToken";
import { NextPage } from "next";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {

  return {
      title: `Create Token - Sloth Agent`,
      description: 'Create a new token'
  }
}     


const CreateTokenPage: NextPage  = () => {
  return <CreateToken />;
};

export default CreateTokenPage;
