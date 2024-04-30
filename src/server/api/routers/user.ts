import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
//for user to register their face
  createProfile: protectedProcedure
    .input(z.object({ label: z.string(), pic:z.string() }))
    .mutation(async ({ ctx, input }) => {
    const data = await ctx.db.user.create({
        data: {
            labels: input.label,
            pic: input.pic,
        },
        });
        return data;
    }),
    
    //gets User Images from db
    getLabelImages: publicProcedure
    .query(async ({ ctx }) => {
        const data = await ctx.db.user.findMany(
            {
                select:{
                    name:true,
                    pic:true
                }
            }
        );
        return data;
    })
});
