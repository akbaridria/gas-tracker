"use client"

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import * as z from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRightIcon } from '@radix-ui/react-icons'
import { Dollar } from "@/components/svgs/dollar";
import { useEffect, useState } from "react";
import { covalentClient } from "@/lib/utils";
import { Chains } from "@covalenthq/client-sdk";
import { Loader } from "@/components/svgs/loader";
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

const formSchema = z.object({
  apiKey: z.string().min(1, {
    message: "API Key is required"
  }),
  chain: z.string({
    required_error: "Please select one of the chain that available",
  }),
  event: z.string({
    required_error: "Please select one of the events that available",
  }),
})


export default function Home() {
  const [listChains, setListChains] = useState<{ name: string, logo: string }[]>([]);
  const [result, setResult] = useState<string[]>(['$', '$', '$']);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: "",
    },
  })

  const listEvents = [
    {
      name: 'ERC-20 Transfer',
      value: 'erc20'
    },
    {
      name: 'Native Token Transfer',
      value: 'nativetokens'
    },
    {
      name: 'Uniswap V3 Swap',
      value: 'uniswapv3'
    }
  ]

  useEffect(() => {
    (async () => {
      try {
        const resp = await covalentClient(process.env.NEXT_PUBLIC_COVALENT_API_KEY as string).BaseService.getAllChains()
        setListChains(resp.data.items.filter((x) => x.is_testnet === false).map((item) => {
          return {
            name: item.name,
            logo: item.logo_url
          }
        }))
      } catch (error) {
        console.log(error);
      }
    })()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      const d = await covalentClient(values.apiKey).BaseService.getGasPrices(values.chain as Chains, values.event);
      if (!d.error) {
        setResult([...d.data.items.map((item) => item.pretty_total_gas_quote)]);
      } else {
        setResult(['$', '$', '$'])
        if (d.error_code === 401) {
          toast({
            title: 'Wrong API Key',
            description: 'Are you sure that you use the right api key ?'
          })
        } 
      }
      setLoading(false)
    } catch (error) {
      console.log(error);
      toast({
        title: 'Opps something went wrong!',
        description: 'Try again in a few minutes'
      })
      setResult(['$', '$', '$'])
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full">
        <CardHeader className="border-b">
          <CardTitle className="scroll-m-20 text-2xl font-semibold tracking-tight">Gas Price Tracker</CardTitle>
          <CardDescription>Powered by covalent api</CardDescription>
        </CardHeader>
        <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 p-6 border-b md:border-r">
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Covalent API Key</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your covalent api key here" {...field} disabled={loading} />
                    </FormControl>
                    <FormDescription>
                      Dont have the key ? <a href="https://www.covalenthq.com/platform/auth/register/" className="font-semibold underline underline-offset-4" target="_blank" rel="noopener noreferrer">register here</a>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="chain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Chains</FormLabel>
                    <Select onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger disabled={loading}>
                          <SelectValue placeholder="Select Chains" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {listChains.map((item) => {
                          return (
                            <SelectItem key={item.name} value={item.name}>
                              <div className="flex items-center gap-2">
                                <img src={item.logo} alt={item.name} className="w-4 h-4 rounded-full" />
                                <div>{item.name}</div>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="event"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Event Type</FormLabel>
                    <Select onValueChange={field.onChange} disabled={loading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Event" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {
                          listEvents.map((item) => {
                            return (
                              <SelectItem key={item.value} value={item.value}>{item.name}</SelectItem>
                            )
                          })
                        }
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button variant="outline" disabled={loading}>
                { loading && <Loader />}
                Get gas price 
                <ArrowRightIcon className="ml-2" />
              </Button>
            </form>
          </Form>
          <div className="grid grid-cols-1 gap-4 p-6">
            {
              result.map((item, index) => {
                return (
                  <Card key={index} className="p-4 h-fit">
                    <CardContent className="pb-3 flex items-center justify-between">
                      <div className="text-sm">Gas Price 1 Minute Average</div>
                      <Dollar />
                    </CardContent>
                    <CardContent className="py-0">
                      { loading ? <Skeleton className="w-[100px] h-[20px]" /> : <div className="text-2xl font-bold">{ item }</div>}
                    </CardContent>
                  </Card>
                )
              })
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
