import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const model = new ChatOpenAI({
  model: 'gpt-4',
  temperature: 0.1,
  apiKey: OPENAI_API_KEY,
});

export async function tokenComponentTool({ prompt }: any) {
  const SYSTEM_TEMPLATE = 
  new SystemMessage(`You are a React component generator specialized in creating beautiful token creation forms.

IMPORTANT: Return ONLY the component code, starting with "() => {" and ending with "}".

The component must implement:

1. Form State:
const [formData, setFormData] = useState({
  name: '',
  symbol: '',
  description: '',
  tokenImage: '',
  initialBuyValue: '',
  facebook: '',
  twitter: '',
  telegram: ''
});

2. Available Functions:
- deployToken(formData) - Deploys token with all form data
- verifyToken(formData) - Verifies deployed token
- uploadToPinata(file) - Uploads image, returns IPFS URL
- toast.success/error/loading - Show notifications

3. Form Submission Flow:
const handleSubmit = async (e) => {
  e.preventDefault();
  const loadingToast = toast.loading('Creating token...');
  try {
    await deployToken(formData);
    await verifyToken(formData);
    toast.success('Token created successfully!');
  } catch (error) {
    toast.error('Failed to create token');
  } finally {
    toast.dismiss(loadingToast);
  }
};

4. Required Form Fields:
- Token Name (required)
- Token Symbol (required)
- Description
- Initial Buy Value
- Token Image (via uploadToPinata)
- Social Media Links (optional):
  * Facebook URL
  * Twitter URL
  * Telegram URL

5. UI Requirements:
- Professional form layout with proper spacing
- Gradient submit button
- Clean input styling
- Image upload with preview
- Loading states
- Error messages

6. Styling Classes:
- Container: max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg
- Inputs: w-full px-4 py-2 border border-gray-300 rounded-lg
- Labels: text-sm font-medium text-gray-700
- Submit: w-full py-3 bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#04D9B2]
- Error: text-sm text-red-600 mt-1

Remember: Create a professional interface with proper error handling and loading states.`);

  const HUMAN_TEMPLATE = new HumanMessage(`Create a beautiful token creation form with:
1. Professional layout and spacing
2. Gradient submit button
3. Clean input styling
4. Nice image upload preview
5. Loading states
6. Error messages
7. Proper use of deployToken and verifyToken functions

Return ONLY the component code starting with "() => {".`);

  const parser = new StringOutputParser();
  const messages = [SYSTEM_TEMPLATE, HUMAN_TEMPLATE];
  const result = await model.invoke(messages);
  const resultParse = await parser.invoke(result);

  if (!resultParse.trim().startsWith('() => {')) {
    return '() => { return <div>Error generating component</div> }';
  }

  return resultParse;
} 