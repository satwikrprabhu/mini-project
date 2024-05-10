import {
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogContent,
    DialogDescription,
    Dialog,
    DialogFooter,
  } from "../components/ui/dialog"
  import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "../components/ui/form"
  
  import z from "zod"
  import { Button } from "../components/ui/button"
  import { zodResolver } from "@hookform/resolvers/zod"
  import {useForm} from "react-hook-form"
  import { Input } from "../components/ui/input"
  import { api } from "~/utils/api"
  import { useToast } from "../components/ui/use-toast"
  import { useSession } from "next-auth/react"
import { useState } from "react"
import { uploadFile } from "~/utils/file"
  
  //Schema for form validation
    const formSchema = z.object({
        label: z.string().min(2, {
        message: "Name must be at least 2 characters.",
      }),
        pic: z.any()
    })
  
  export function EditProfile() {
    const [files, setFiles] = useState<File>();
    const { toast } = useToast()
    
    const register = api.user.createProfile.useMutation(
      {
        //OnSuccess Toast
        onSuccess: () => {
          toast({
            title: "Updated Profile Successfully!",
            description: "Your profile has been updated successfully.",
            variant: "default",
          })
        },
        onError:()=>{
          toast({
            title:"Uh oh! Something went wrong!",
            description:"Please try again later.",
            variant:"destructive"
          })
        }
      }
    )
      //Default values for form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            label: '',
            pic: '',
            
        },
    })
  
  
      //OnSubmit function
      async function onSubmit(values: z.infer<typeof formSchema>) {
        if(files){
            const data = String(await uploadFile(files));
        
        register.mutate({
          label: values.label,
          pic:  data,
        })
    }
    else{
        console.log("No file selected")
    }
       
        console.log(values);
      }
      
      
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button className="rounded-md bg-white/10 px-6 font-semibold text-white no-underline transition hover:bg-white/20">Edit Profile</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
  
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="pic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload your picture</FormLabel >
                <FormControl>
                <Input id="poster" type="file" {...field} onChange={(file)=>{
                  file.target.files &&
                 setFiles(file?.target?.files[0])
                }}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
   
          <Button type="submit" className="text-right">Submit</Button>
        </form>
      </Form>
        </DialogContent>
      </Dialog>
    )
  }