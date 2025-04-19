require('dotenv').config();
const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const cors = require('cors');
const{GoogleGenAI} =require('@google/genai')
const fs = require('fs');
const mongoose = require('mongoose')
const User = require('./modals/signupmodel.js')
const path = require('path');

const app = express()

app.use(bodyParser.urlencoded())
app.use(bodyParser.json())
app.use(express.json());


const PORT = process.env.PORT || 8000
const URL = process.env.URL

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(URL);
    console.log("connect to  db")


}
app.use(cors({
    origin:["http://localhost:5173"],
    credentials:true
}));

const github={
    name : "gouracv",
    age:27
}

app.get("/github",(req,res)=>{
    res.json(github)
})


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.post("/api/v1/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "user already exist" })
        }

        const createdUser = new User({
            name: name,
            email: email,
            password: password,
        })
        createdUser.save();
        res.status(201).json({ message: "user created sucessfully" })

    } catch (error) {
        res.status(404).json({ message: "internal server error" })
    }
})

app.post("/api/v1/login", async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "user doesnt exist" })
        }
        const ismatch = await bcrypt.compare(password, user.password)
        if (!ismatch) {
            return res.status(404).json({ message: "password not matched" })

        }
        const acesstoken =  jwt.sign({ id: user._id }, process.env.JWT_TOKEN, { expiresIn: "1m" });
        const refrshtoken= jwt.sign({id:user._id},"jwt-refresh-token-secret-key",{expiresIn:"2m"})
        res.cookie('acesstoken',acesstoken,{maxAge:60000,httpOnly:true,secure:true,sameSite:"strict"})
        res.cookie('refreshtoken',refrshtoken,{maxAge:300000,httpOnly:true,secure:true,sameSite:"strict"}) 
        
        
        user.token = acesstoken
        
        user.save();
        return res.status(201).json({ message: "login sucess" })
    } catch (error) {
        return res.status(500).json({ message: "server error" })
    }
})

app.post('/api/v1/summery', async (req, res) => {

    const {text}=req.body

    try {



        // const ai = new GoogleGenAI({ apiKey: process.env.OPENAI_API });
        const imagePath = path.join(__dirname, 'images', 'Moeraki-Boulders-New-Zealand.jpg')


        res.sendFile(imagePath, (err) => {
            if (err) {
              console.error('Error sending the image:', err);
              res.status(500).send('Error sending the image');
            }
          });

        // async function main() {
        //     const response = await ai.models.generateContent({
        //         model: "gemini-2.0-flash-exp-image-generation",
        //         contents: ` ${text} `,
                
        //         config:{
        //             responseModalities:['Text','Image'],
        //             temperature:0.5
                    
                    
                
                    
        //         }
                
        //     });
        //     for (const part of response.candidates[0].content.parts) {
            
                
        //         // Based on the part type, either show the text or save the image
        //         if (part.text) {
        //           res.status(201).json({message:"text is created"})
        //         } else if (part.inlineData) {
        //           const imageData = part.inlineData.data;
                 
        //           const buffer = Buffer.from(imageData, "base64");
        //           fs.writeFileSync("gemini-native-image.png", buffer)
                 
        //           return res.sendFile(imagePath)
        //         }
        //       }
            
        // }
        // await main();

    } catch (error) {
        res.status(500).json({})

    }
})



app.post('/api/v1/paragraph', async (req, res) => {

    const {text}=req.body

    try {



        const ai = new GoogleGenAI({ apiKey: process.env.OPENAI_API });
        

        async function main() {
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: `give me a detail and easy paragraph on  ${text} `,
            });
            const paragraph=(response.candidates[0].content.parts[0].text)




            if (response) {
                
                res.status(201).json({ message: "done",paragraph:paragraph })
            }
            
        }
        await main();

    } catch (error) {
        console.log(error)

    }
})

app.post('/api/v1/Chatbot', async (req, res) => {

    const {text}=req.body

    try {



        const ai = new GoogleGenAI({ apiKey: process.env.OPENAI_API });

        async function main() {
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash",
                contents: `answer question similar to how miakhalifa would. me:"what is your name ?" sunnyleone:"leone is here". me: ${text}`,
            });

            const Chatboat=(response.candidates[0].content.parts[0].text)




            if (response) {
                res.status(201).json({ message: "done",Chatboat:Chatboat })
            }
            
        }
        await main();

    } catch (error) {
        console.log(error)

    }
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})