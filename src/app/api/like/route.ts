import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prismadb'
import { getCurrentUser } from '../user/route'
import axios from 'axios'

const url = `https://newsapi.org/v2/top-headlines?category=technology`
const apiKey = '9aff6f6f856246c6b693fee8ce809239' // ARREGLAR

export async function PUT(req: NextRequest) {
  const liked: { liked: boolean, id: string } = await req.json()

  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ err: 'Unauthorized' }, { status: 401 })
  }

  try {
    const article = await axios.get(url, { params: { apiKey } }).then(res => res.data)
    let likedArts = []

    if (liked) {
      likedArts = [...user.liked, article]
      await prisma.user.update({
        where: { id: user.id },
        data: {
          liked: likedArts
        }
      })
    } else {
      likedArts = user.liked.filter(likedArt => likedArt.title !== article.title)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          liked: likedArts
        }
      })
    }
    return NextResponse.json({ msg: 'OK' }, { status: 200 })
  } catch (_error) {
    return NextResponse.json({ err: 'Internal Server Error' }, { status: 500 })
  }
}
