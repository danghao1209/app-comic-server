import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ComicService } from './comic.service';
import * as mongoose from 'mongoose';
import { Response } from 'express';
import { ChapterService } from 'src/chapter/chapter.service';
import { UserService } from 'src/user/user.service';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
@Controller('comics')
export class ComicController {
  constructor(
    private readonly comicService: ComicService,
    private readonly chapterService: ChapterService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Get(':id')
  async getComicById(
    @Request() req,
    @Param('id') params: string,
    @Res() res: Response,
  ) {
    try {
      const comic = await this.comicService.getComic(
        new mongoose.Types.ObjectId(params),
      );
      const viewPromises = comic.chapters.map(async (number) => {
        const view = await this.chapterService.getView(number);
        return view;
      });
      const views = await Promise.all(viewPromises);
      const totalView = views.reduce((acc, view) => acc + view, 0);
      comic.totalViews = totalView;
      const user = await this.userService.findById(
        new mongoose.Types.ObjectId(req.user.id),
      );
      const isSub = user.subscribe.includes(
        new mongoose.Types.ObjectId(params),
      );
      const response = {
        _id: comic._id,
        title: comic.title,
        description: comic.description,
        thumbImg: comic.thumbImg,
        previewImg: comic.previewImg,
        chapters: comic.chapters,
        rate: comic.rate,
        genre: comic.genre,
        author: comic.author,
        comment: comic.comment,
        totalViews: comic.totalViews,
        isSub: isSub,
      };

      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      if (error instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Something went wrong',
        });
      }
    }
  }

  @Get('listchapter/:id')
  async getChaptersById(@Param('id') params: string, @Res() res: Response) {
    try {
      const comic = await this.comicService.getComic(
        new mongoose.Types.ObjectId(params),
      );
      const viewPromises = comic.chapters.map(async (number) => {
        const view = await this.chapterService.getView(number);
        return view;
      });
      const views = await Promise.all(viewPromises);
      const totalView = views.reduce((acc, view) => acc + view, 0);
      comic.totalViews = totalView;
      const chaptersComic = await this.chapterService.getChapterByListId(
        comic.chapters,
      );

      return res.status(HttpStatus.OK).json(chaptersComic);
    } catch (error) {
      if (error instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Something went wrong',
        });
      }
    }
  }

  @Get('/get/all')
  async getAllComic(@Res() res: Response) {
    try {
      const listComic = await this.comicService.getAllComic();
      const viewPromises = listComic.map(async (comic) => {
        const chapterViews = await Promise.all(
          comic.chapters.map(async (number) => {
            const view = await this.chapterService.getView(number);
            return view;
          }),
        );
        const totalView = chapterViews.reduce((acc, view) => acc + view, 0);
        comic.totalViews = totalView;
        return comic;
      });
      const newListComic = await Promise.all(viewPromises);

      return res.status(HttpStatus.OK).json(newListComic);
    } catch (error) {
      console.log(error.message);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong',
      });
    }
  }

  @Get('search/genre/:genre')
  async getComicByGenre(@Param('genre') params: string, @Res() res: Response) {
    try {
      const listComic = await this.comicService.getComicByGenre(params);
      const viewPromises = listComic.map(async (comic) => {
        const chapterViews = await Promise.all(
          comic.chapters.map(async (number) => {
            const view = await this.chapterService.getView(number);
            return view;
          }),
        );
        const totalView = chapterViews.reduce((acc, view) => acc + view, 0);
        return {
          _id: comic._id,
          title: comic.title,
          description: comic.description,
          thumbImg: comic.thumbImg,
          previewImg: comic.previewImg,
          chapters: comic.chapters,
          rate: comic.rate,
          genre: comic.genre,
          author: comic.author,
          comment: comic.comment,
          totalView,
        };
      });

      const newListComic = await Promise.all(viewPromises);
      return res.status(HttpStatus.OK).json(newListComic);
    } catch (error) {
      console.log(error.message);
      if (error instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Something went wrong',
        });
      }
    }
  }

  @Get('search/genre')
  async searchAllGenre(@Res() res: Response) {
    try {
      const listComic = await this.comicService.getAllComic();
      const viewPromises = listComic.map(async (comic) => {
        const chapterViews = await Promise.all(
          comic.chapters.map(async (number) => {
            const view = await this.chapterService.getView(number);
            return view;
          }),
        );
        const totalView = chapterViews.reduce((acc, view) => acc + view, 0);
        comic.totalViews = totalView;
        return comic;
      });
      const newListComic = await Promise.all(viewPromises);

      return res.status(HttpStatus.OK).json(newListComic);
    } catch (error) {
      console.log(error.message);
      if (error instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Something went wrong',
        });
      }
    }
  }

  @Get('search/param/:name')
  async searchComic(
    @Param('name') params: string | null,
    @Res() res: Response,
  ) {
    try {
      console.log(params);
      const comic = await this.comicService.searchByName(params);
      const viewPromises = comic.map(async (comic) => {
        const chapterViews = await Promise.all(
          comic.chapters.map(async (number) => {
            const view = await this.chapterService.getView(number);
            return view;
          }),
        );
        const totalView = chapterViews.reduce((acc, view) => acc + view, 0);
        comic.totalViews = totalView;
        return comic;
      });
      const newListComic = await Promise.all(viewPromises);
      return res.status(HttpStatus.OK).json(newListComic);
    } catch (error) {
      console.log(error.message);
      if (error instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Something went wrong',
        });
      }
    }
  }

  @Get('/search/param')
  async searchComicNonParam(@Res() res: Response) {
    try {
      const listComic = await this.comicService.getAllComic();
      const viewPromises = listComic.map(async (comic) => {
        const chapterViews = await Promise.all(
          comic.chapters.map(async (number) => {
            const view = await this.chapterService.getView(number);
            return view;
          }),
        );
        const totalView = chapterViews.reduce((acc, view) => acc + view, 0);
        comic.totalViews = totalView;
        return comic;
      });
      const newListComic = await Promise.all(viewPromises);

      return res.status(HttpStatus.OK).json(newListComic);
    } catch (error) {
      console.log(error.message);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Something went wrong',
      });
    }
  }

  @Get('get/trending')
  async hi(@Res() res: Response) {
    try {
      const listComic = await this.comicService.getAllComic();
      const viewPromises = listComic.map(async (comic) => {
        const chapterViews = await Promise.all(
          comic.chapters.map(async (number) => {
            const view = await this.chapterService.getView(number);
            return view;
          }),
        );
        const totalView = chapterViews.reduce((acc, view) => acc + view, 0);
        comic.totalViews = totalView;
        return comic;
      });
      const newListComic = await Promise.all(viewPromises);

      const sortedComic = newListComic.sort(
        (a, b) => b.totalViews - a.totalViews,
      );

      return res.status(HttpStatus.OK).json(sortedComic);
    } catch (error) {
      console.log(error.message);
      if (error instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Something went wrong',
        });
      }
    }
  }

  @Get('get/newarrvals')
  async newArrvals(@Res() res: Response) {
    try {
      const listComicCreate = await this.comicService.getNewestComics(5);
      const newestComic = listComicCreate.map(async (comic) => {
        const chapterViews = await Promise.all(
          comic.chapters.map(async (number) => {
            const view = await this.chapterService.getView(number);
            return view;
          }),
        );
        const totalView = chapterViews.reduce((acc, view) => acc + view, 0);
        comic.totalViews = totalView;
        return comic;
      });
      const listNewest = await Promise.all(newestComic);

      return res.status(HttpStatus.OK).json(listNewest);
    } catch (error) {
      console.log(error.message);
      if (error instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Something went wrong',
        });
      }
    }
  }

  @Get('get/topseries')
  async comicHome(@Res() res: Response) {
    try {
      const listComic = await this.comicService.getAllComic();
      const viewPromises = listComic.map(async (comic) => {
        const chapterViews = await Promise.all(
          comic.chapters.map(async (number) => {
            const view = await this.chapterService.getView(number);
            return view;
          }),
        );
        const totalView = chapterViews.reduce((acc, view) => acc + view, 0);
        comic.totalViews = totalView;
        return comic;
      });
      const newListComic = await Promise.all(viewPromises);
      newListComic.forEach((comic) => {
        const totalRate = comic.rate.reduce((acc, rate) => acc + rate.rate, 0);
        comic.totalRates = totalRate;
      });
      const topSeriesComic = newListComic.sort(
        (a, b) => b.totalRates - a.totalRates,
      );
      return res.status(HttpStatus.OK).json(topSeriesComic);
    } catch (error) {
      console.log(error.message);
      if (error instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Something went wrong',
        });
      }
    }
  }

  @UseGuards(AccessTokenGuard)
  @Post('/subscribe')
  async subscribeComic(
    @Request() req,
    @Body('comicId') comicId: string,
    @Res() res: Response,
  ) {
    try {
      console.log(comicId);
      const comicID = new mongoose.Types.ObjectId(comicId);
      const [subscriber, comic] = await Promise.all([
        this.userService.subscribe(
          new mongoose.Types.ObjectId(req.user.id),
          comicID,
        ),
        this.comicService.getComic(comicID),
      ]);

      if (subscriber) {
        comic.totalSub++;
      } else {
        comic.totalSub--;
      }
      await this.comicService.update(comicID, comic);
      return res.status(HttpStatus.OK).json({ data: subscriber });
    } catch (error) {
      if (error instanceof BadRequestException) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: error.message,
        });
      } else {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Something went wrong',
        });
      }
    }
  }

  @UseGuards(AccessTokenGuard)
  @Get('/get/getsub')
  async GetListSub(@Request() req, @Res() res: Response) {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);
      const user = await this.userService.findById(userId);

      const listSub = await Promise.all(
        user.subscribe.map((commentId) =>
          this.comicService
            .getComic(commentId)
            .then(({ _id, title, thumbImg }) => ({
              id: _id,
              title,
              thumbImg,
            })),
        ),
      );

      return res.status(HttpStatus.OK).json({ listSub });
    } catch (error) {
      return res
        .status(
          error instanceof BadRequestException
            ? HttpStatus.BAD_REQUEST
            : HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json({ message: error.message });
    }
  }
}
